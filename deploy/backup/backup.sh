#!/usr/bin/env bash
# Daily backup of ERP Rehla (database + uploaded files + env) to an encrypted
# Google Drive folder via rclone crypt.
#
# Runs as user `deploy` from a systemd user timer. It only reads from the
# rehlatours-erp-legacy-* containers/volumes of deploy's rootless Docker and
# writes below BACKUP_DIR and the rclone remote. Nothing else on the server
# is touched.
#
# Remote layout (names are encrypted on Google Drive):
#   db/YYYY/MM/rehla_erp-<stamp>.dump    pg_dump custom format
#   files/...                             mirror of the uploads volume
#   files-archive/<date>/...              files changed/deleted since last run
#   config/env-<stamp>.tar                env files (for disaster recovery)
#   manifest/<stamp>.json                 row counts + checksums of this run
set -euo pipefail

export DOCKER_HOST="${DOCKER_HOST:-unix:///run/user/$(id -u)/docker.sock}"
RCLONE="${RCLONE:-/home/deploy/bin/rclone}"
export RCLONE_CONFIG="${RCLONE_CONFIG:-/home/deploy/.config/rclone/rclone.conf}"
REMOTE="${BACKUP_REMOTE:-rehla-backup:}"
BACKUP_DIR="${BACKUP_DIR:-/home/deploy/rehlatours/shared/backups}"
ENV_DIR="${ENV_DIR:-/home/deploy/rehlatours/shared/env}"
ERP_ENV_FILE="${ERP_ENV_FILE:-$ENV_DIR/legacy-erp.env}"
DB_CONTAINER=rehlatours-erp-legacy-postgres-1
FILES_VOLUME=rehlatours-erp-legacy-files
HELPER_IMAGE=postgres:17.6-alpine   # already on the host; only used for tar

LOCAL_KEEP_DAYS=7        # local dumps
REMOTE_DAILY_DAYS=30     # every dump younger than this is kept
REMOTE_MONTHLY_DAYS=365  # dumps taken on day 01 are kept this long
ARCHIVE_KEEP_DAYS=90     # files-archive/, config/
MAX_FILE_DELETES=25      # refuse a sync that would remove more files than this

umask 077
stamp=$(date -u +%Y%m%dT%H%M%SZ)
today=$(date -u +%Y-%m-%d)
log() { printf '%s %s\n' "$(date -u +%H:%M:%SZ)" "$*"; }

env_value() { sed -n "s/^$1=//p" "$ERP_ENV_FILE" | tail -n 1; }

notify() {
  # Best effort WhatsApp message to the admin through the ERP's WAHA instance.
  local url key session phone
  url=$(env_value WA_API_URL); key=$(env_value WA_API_KEY)
  session=$(env_value WA_SESSION); phone=$(env_value WA_ADMIN_PHONE)
  [ -n "$url" ] && [ -n "$key" ] && [ -n "$phone" ] || return 0
  curl -fsS -m 20 -X POST "${url%/}/api/sendText" \
    -H "X-Api-Key: $key" -H 'Content-Type: application/json' \
    -d "$(printf '{"session":"%s","chatId":"%s@c.us","text":"%s"}' "${session:-default}" "${phone//[^0-9]/}" "$1")" \
    >/dev/null 2>&1 || log 'warn: WhatsApp notification could not be sent'
}

step='start'
on_error() {
  local code=$?
  log "FAILED at step: $step (exit $code)"
  printf '%s failed step=%s exit=%s\n' "$stamp" "$step" "$code" > "$BACKUP_DIR/last-status"
  notify "⚠️ Backup ERP Rehla GAGAL ($today) pada langkah: $step. Cek: journalctl --user -u rehlatours-backup"
  exit "$code"
}
trap on_error ERR

mkdir -p "$BACKUP_DIR/db" "$BACKUP_DIR/config" "$BACKUP_DIR/manifest"
chmod 700 "$BACKUP_DIR"

# One run at a time.
exec 9> "$BACKUP_DIR/.lock"
flock -n 9 || { log 'another backup is running; exiting'; exit 0; }

step='preflight'
[ -x "$RCLONE" ] || { log "rclone missing at $RCLONE"; false; }
[ -r "$ERP_ENV_FILE" ] || { log "missing $ERP_ENV_FILE"; false; }
[ "$(docker inspect "$DB_CONTAINER" --format '{{.State.Health.Status}}')" = healthy ] || { log 'database container is not healthy'; false; }
"$RCLONE" lsd "$REMOTE" >/dev/null   # remote reachable and crypt key valid

# ── 1. Database ───────────────────────────────────────────────────────────
step='database dump'
dump="$BACKUP_DIR/db/rehla_erp-$stamp.dump"
docker exec "$DB_CONTAINER" sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --format=custom --no-owner --no-privileges' > "$dump.partial"
# A dump that pg_restore cannot list is not a backup.
docker exec -i "$DB_CONTAINER" pg_restore --list < "$dump.partial" > /dev/null
[ "$(stat -c %s "$dump.partial")" -gt 1024 ] || { log 'dump is suspiciously small'; false; }
mv "$dump.partial" "$dump"
dump_sha=$(sha256sum "$dump" | cut -d' ' -f1)

step='row counts'
counts=$(docker exec -i "$DB_CONTAINER" sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -At -v ON_ERROR_STOP=1' <<'SQL'
select json_object_agg(table_name,
         (xpath('/row/c/text()', query_to_xml(format('select count(*) as c from public.%I', table_name), false, true, '')))[1]::text::int
         order by table_name)
from information_schema.tables
where table_schema = 'public' and table_type = 'BASE TABLE';
SQL
)
[ -n "$counts" ] || { log 'row counts are empty'; false; }

# ── 2. Uploaded files ─────────────────────────────────────────────────────
# The volume belongs to a sub-uid, so it is read through a container and
# unpacked here as `deploy` into a fresh mirror directory.
step='files export'
mirror_new="$BACKUP_DIR/files-mirror.new"
rm -rf "$mirror_new"; mkdir -p "$mirror_new"
docker run --rm --user 0 --network none --entrypoint tar \
  -v "$FILES_VOLUME:/src:ro" "$HELPER_IMAGE" -C /src -cf - . | tar -C "$mirror_new" -xf -
file_count=$(find "$mirror_new" -type f | wc -l)
file_bytes=$(du -sb "$mirror_new" | cut -f1)
previous_count=$(cat "$BACKUP_DIR/files-count" 2>/dev/null || echo 0)
# An empty or sharply shrunken export means something is wrong with the
# volume, not that users deleted their documents. Never sync that upstream.
if [ "$file_count" -eq 0 ] || [ $((file_count * 2)) -lt "$previous_count" ]; then
  log "file export has $file_count files (previous $previous_count); refusing to sync"; false
fi
rm -rf "$BACKUP_DIR/files-mirror"; mv "$mirror_new" "$BACKUP_DIR/files-mirror"

# ── 3. Env files ──────────────────────────────────────────────────────────
step='env archive'
env_tar="$BACKUP_DIR/config/env-$stamp.tar"
tar -C "$ENV_DIR" -cf "$env_tar" $(cd "$ENV_DIR" && ls legacy-erp.env website.staging.env 2>/dev/null)

# ── 4. Manifest ───────────────────────────────────────────────────────────
step='manifest'
manifest="$BACKUP_DIR/manifest/$stamp.json"
printf '{"stamp":"%s","dump":"rehla_erp-%s.dump","dumpSha256":"%s","dumpBytes":%s,"fileCount":%s,"fileBytes":%s,"rowCounts":%s}\n' \
  "$stamp" "$stamp" "$dump_sha" "$(stat -c %s "$dump")" "$file_count" "$file_bytes" "$counts" > "$manifest"

# ── 5. Upload ─────────────────────────────────────────────────────────────
rc() { nice -n 10 ionice -c 3 "$RCLONE" --retries 5 --low-level-retries 10 --stats 0 "$@"; }
ym=$(date -u +%Y/%m)

step='upload database'
rc copy "$dump" "${REMOTE}db/$ym/"
rc check --download --one-way "$BACKUP_DIR/db" "${REMOTE}db/$ym/" --include "rehla_erp-$stamp.dump"

step='upload files'
rc sync "$BACKUP_DIR/files-mirror" "${REMOTE}files" \
  --backup-dir "${REMOTE}files-archive/$today" --max-delete "$MAX_FILE_DELETES"
rc check --one-way --size-only "$BACKUP_DIR/files-mirror" "${REMOTE}files"

step='upload env and manifest'
rc copy "$env_tar" "${REMOTE}config/"
rc copy "$manifest" "${REMOTE}manifest/"

# ── 6. Retention ──────────────────────────────────────────────────────────
step='retention'
find "$BACKUP_DIR/db" "$BACKUP_DIR/config" -type f -mtime +"$LOCAL_KEEP_DAYS" -delete
find "$BACKUP_DIR/manifest" -type f -mtime +"$REMOTE_MONTHLY_DAYS" -delete

now=$(date -u +%s)
rc lsf -R --files-only "${REMOTE}db" | while IFS= read -r path; do
  name=${path##*/}
  day=$(printf '%s' "$name" | sed -n 's/^rehla_erp-\([0-9]\{8\}\)T.*\.dump$/\1/p')
  [ -n "$day" ] || continue
  age=$(( (now - $(date -u -d "${day:0:4}-${day:4:2}-${day:6:2}" +%s)) / 86400 ))
  if [ "$age" -gt "$REMOTE_MONTHLY_DAYS" ] || { [ "$age" -gt "$REMOTE_DAILY_DAYS" ] && [ "${day:6:2}" != 01 ]; }; then
    rc deletefile "${REMOTE}db/$path"
  fi
done
rc delete "${REMOTE}files-archive" --min-age "${ARCHIVE_KEEP_DAYS}d" 2>/dev/null || true
rc rmdirs "${REMOTE}files-archive" --leave-root 2>/dev/null || true
rc delete "${REMOTE}config" --min-age "${ARCHIVE_KEEP_DAYS}d" 2>/dev/null || true
rc delete "${REMOTE}manifest" --min-age "${REMOTE_MONTHLY_DAYS}d" 2>/dev/null || true

# ── 7. Done ───────────────────────────────────────────────────────────────
step='finish'
printf '%s\n' "$file_count" > "$BACKUP_DIR/files-count"
printf '%s ok dump=%s files=%s\n' "$stamp" "$(stat -c %s "$dump")" "$file_count" > "$BACKUP_DIR/last-status"
log "backup ok: dump $(stat -c %s "$dump") bytes, $file_count files ($file_bytes bytes)"
# A weekly confirmation proves the timer itself is still alive.
if [ "$(date -u +%u)" = 1 ]; then
  notify "✅ Backup ERP Rehla berjalan normal. Terakhir: $today, $file_count file, database $(( $(stat -c %s "$dump") / 1024 )) KB."
fi
