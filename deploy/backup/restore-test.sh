#!/usr/bin/env bash
# Proves the newest Google Drive backup can really be restored.
#
# Downloads the latest dump + manifest from the encrypted remote, restores the
# dump into a THROW-AWAY PostgreSQL container (no ports, no volume), compares
# every table's row count with the manifest, and checks the remote file mirror
# against the manifest. The live database and files are never touched.
set -euo pipefail

export DOCKER_HOST="${DOCKER_HOST:-unix:///run/user/$(id -u)/docker.sock}"
RCLONE="${RCLONE:-/home/deploy/bin/rclone}"
export RCLONE_CONFIG="${RCLONE_CONFIG:-/home/deploy/.config/rclone/rclone.conf}"
REMOTE="${BACKUP_REMOTE:-rehla-backup:}"
PG_IMAGE=postgres:17.6-alpine
NAME=rehlatours-restore-test

umask 077
work=$(mktemp -d)
cleanup() { docker rm -f "$NAME" >/dev/null 2>&1 || true; rm -rf "$work"; }
trap cleanup EXIT
log() { printf '==> %s\n' "$*"; }
rc() { "$RCLONE" --retries 5 --low-level-retries 10 --stats 0 "$@" 2> >(grep -v 'shared Google Drive client_id' >&2); }

latest=$(rc lsf "${REMOTE}manifest" --files-only | sort | sed -n '$p')
[ -n "$latest" ] || { echo 'no manifest on the remote'; exit 1; }
stamp=${latest%.json}
ym="${stamp:0:4}/${stamp:4:2}"
log "Latest backup on Google Drive: $stamp"

rc copy "${REMOTE}manifest/$latest" "$work/"
rc copy "${REMOTE}db/$ym/rehla_erp-$stamp.dump" "$work/"
dump="$work/rehla_erp-$stamp.dump"

expected_sha=$(sed -n 's/.*"dumpSha256":"\([0-9a-f]*\)".*/\1/p' "$work/$latest")
actual_sha=$(sha256sum "$dump" | cut -d' ' -f1)
[ "$expected_sha" = "$actual_sha" ] || { echo "dump checksum mismatch"; exit 1; }
log 'Downloaded dump matches the manifest checksum.'

docker rm -f "$NAME" >/dev/null 2>&1 || true
docker run -d --name "$NAME" --network none --tmpfs /var/lib/postgresql/data \
  -e POSTGRES_PASSWORD=restore-test -e POSTGRES_DB=restore "$PG_IMAGE" >/dev/null
for _ in $(seq 1 30); do
  docker exec "$NAME" pg_isready -U postgres -d restore >/dev/null 2>&1 && break
  sleep 2
done
sleep 2
docker exec -i "$NAME" pg_restore -U postgres -d restore --no-owner --no-privileges --single-transaction --exit-on-error < "$dump"

restored=$(docker exec -i "$NAME" psql -U postgres -d restore -At -v ON_ERROR_STOP=1 <<'SQL'
select json_object_agg(table_name,
         (xpath('/row/c/text()', query_to_xml(format('select count(*) as c from public.%I', table_name), false, true, '')))[1]::text::int
         order by table_name)
from information_schema.tables
where table_schema = 'public' and table_type = 'BASE TABLE';
SQL
)
expected=$(sed -n 's/.*"rowCounts":\({.*}\)}$/\1/p' "$work/$latest")
norm() { printf '%s' "$1" | tr -d ' \n'; }
if [ "$(norm "$restored")" != "$(norm "$expected")" ]; then
  echo "row counts differ"; echo "manifest: $expected"; echo "restored: $restored"; exit 1
fi
log "Restored database matches the manifest: $(norm "$restored")"

expected_files=$(sed -n 's/.*"fileCount":\([0-9]*\).*/\1/p' "$work/$latest")
remote_files=$(rc lsf -R --files-only "${REMOTE}files" | wc -l)
[ "$remote_files" -eq "$expected_files" ] || { echo "remote has $remote_files files, manifest says $expected_files"; exit 1; }
log "Remote file mirror has $remote_files files, as in the manifest."

# Decrypt one real file end to end.
sample=$(rc lsf -R --files-only "${REMOTE}files" | sed -n 1p)
rc copyto "${REMOTE}files/$sample" "$work/sample"
[ -s "$work/sample" ] || { echo 'sample file is empty'; exit 1; }
log "Sample file decrypts correctly ($(stat -c %s "$work/sample") bytes)."
log 'RESTORE TEST PASSED'
