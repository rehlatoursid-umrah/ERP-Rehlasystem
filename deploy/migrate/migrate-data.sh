#!/bin/sh
# Moves ERP Rehla data from Supabase + Cloudflare R2 into the self-hosted stack.
#
# Run as user `deploy` on the VPS, from the repository root of a release:
#   deploy/migrate/migrate-data.sh <step>
#
# Steps (each is safe to repeat):
#   dump           pg_dump the Supabase `public` schema (read-only on Supabase)
#   restore        load the newest dump into the new PostgreSQL (REPLACES target data)
#   copy-files     copy every R2 object into the files volume (read-only on R2)
#   rewrite-urls   replace the old R2 public URL prefix with FILES_PUBLIC_URL
#   verify         compare row counts and files, and check no R2 URL remains
#
# It only touches the rootless Docker daemon of `deploy` and resources named
# rehlatours-erp-legacy-*. Supabase and R2 are never written to.
set -eu

DOCKER_HOST="${DOCKER_HOST:-unix:///run/user/1001/docker.sock}"
export DOCKER_HOST
ERP_ENV_FILE="${ERP_ENV_FILE:-/home/deploy/rehlatours/shared/env/legacy-erp.env}"
SOURCE_ENV_FILE="${SOURCE_ENV_FILE:-/home/deploy/rehlatours/shared/env/legacy-source.env}"
WORK_DIR="${WORK_DIR:-/home/deploy/rehlatours/shared/legacy-migration}"
PG_IMAGE=postgres:17.6-alpine
ERP_IMAGE=rehlatours-erp-legacy-erp
DB_CONTAINER=rehlatours-erp-legacy-postgres-1
FILES_VOLUME=rehlatours-erp-legacy-files
COMPOSE="docker compose --env-file $ERP_ENV_FILE -f deploy/compose.vps.yml"

die() { printf 'error: %s\n' "$*" >&2; exit 1; }
info() { printf '==> %s\n' "$*"; }

[ "$(id -un)" = deploy ] || die 'run as user deploy'
[ -f deploy/compose.vps.yml ] || die 'run from the repository root'
[ -r "$ERP_ENV_FILE" ] || die "missing $ERP_ENV_FILE"
[ -r "$SOURCE_ENV_FILE" ] || die "missing $SOURCE_ENV_FILE"
umask 077
mkdir -p "$WORK_DIR"
chmod 700 "$WORK_DIR"

env_value() { sed -n "s/^$2=//p" "$1" | tail -n 1; }

# Counts rows of every table in schema public; output: "<table>|<count>" sorted.
COUNT_SQL="select table_name || '|' || (xpath('/row/c/text()', query_to_xml(format('select count(*) as c from public.%I', table_name), false, true, '')))[1]::text from information_schema.tables where table_schema = 'public' and table_type = 'BASE TABLE' order by 1"

source_psql() {
  docker run --rm -i --env-file "$SOURCE_ENV_FILE" "$PG_IMAGE" sh -c 'psql "$SUPABASE_DIRECT_URL" -v ON_ERROR_STOP=1 -At "$@"' sh "$@"
}

target_psql() {
  docker exec -i "$DB_CONTAINER" sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1 -At "$@"' sh "$@"
}

require_target_db() {
  status=$(docker inspect "$DB_CONTAINER" --format '{{.State.Health.Status}}' 2>/dev/null || true)
  [ "$status" = healthy ] || die "$DB_CONTAINER is not healthy; start it: $COMPOSE up -d postgres"
}

step_dump() {
  stamp=$(date -u +%Y%m%dT%H%M%SZ)
  out="$WORK_DIR/supabase-$stamp.dump"
  info "Dumping Supabase schema public to $out"
  docker run --rm --env-file "$SOURCE_ENV_FILE" "$PG_IMAGE" \
    sh -c 'pg_dump "$SUPABASE_DIRECT_URL" --schema=public --no-owner --no-privileges --format=custom' > "$out.partial"
  mv "$out.partial" "$out"
  source_psql -c "$COUNT_SQL" > "$WORK_DIR/source-counts-$stamp.txt"
  info "Dump size: $(du -h "$out" | cut -f1). Source row counts saved to source-counts-$stamp.txt"
}

step_restore() {
  require_target_db
  dump=$(ls -1t "$WORK_DIR"/supabase-*.dump 2>/dev/null | head -n 1)
  [ -n "$dump" ] || die 'no dump found; run the dump step first'
  info "Restoring $dump into $DB_CONTAINER (existing objects in schema public are replaced)"
  docker exec -i "$DB_CONTAINER" sh -c \
    'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists --no-owner --no-privileges --single-transaction --exit-on-error' < "$dump"
  info 'Restore finished.'
}

step_copy_files() {
  docker image inspect "$ERP_IMAGE" >/dev/null 2>&1 || die "image $ERP_IMAGE missing; build first: $COMPOSE build erp"
  docker volume inspect "$FILES_VOLUME" >/dev/null 2>&1 || docker volume create "$FILES_VOLUME" >/dev/null
  stamp=$(date -u +%Y%m%dT%H%M%SZ)
  info "Copying R2 objects into volume $FILES_VOLUME"
  docker run --rm --env-file "$SOURCE_ENV_FILE" -e FILES_DIR=/data/files \
    -v "$FILES_VOLUME:/data/files" -v "$PWD/deploy/migrate:/app/migrate:ro" \
    --entrypoint node "$ERP_IMAGE" /app/migrate/copy-r2.mjs > "$WORK_DIR/r2-manifest-$stamp.json"
  info "Manifest saved to $WORK_DIR/r2-manifest-$stamp.json"
}

step_rewrite_urls() {
  require_target_db
  old=$(env_value "$SOURCE_ENV_FILE" R2_PUBLIC_URL)
  new=$(env_value "$ERP_ENV_FILE" FILES_PUBLIC_URL)
  [ -n "$old" ] && [ -n "$new" ] || die 'R2_PUBLIC_URL (source env) and FILES_PUBLIC_URL (ERP env) are required'
  old="${old%/}/"; new="${new%/}/"
  info "Rewriting URL prefix $old -> $new in every text column of schema public"
  target_psql -v old="$old" -v new="$new" <<'SQL'
select set_config('migrate.old', :'old', false), set_config('migrate.new', :'new', false) \g /dev/null
do $$
declare
  c record;
  n bigint;
  old_prefix text := current_setting('migrate.old');
  new_prefix text := current_setting('migrate.new');
begin
  for c in
    select table_name, column_name from information_schema.columns
    where table_schema = 'public' and data_type in ('text', 'character varying')
  loop
    execute format('update public.%I set %I = replace(%I, $1, $2) where %I like $3',
                   c.table_name, c.column_name, c.column_name, c.column_name)
      using old_prefix, new_prefix, '%' || old_prefix || '%';
    get diagnostics n = row_count;
    if n > 0 then raise notice '%.%: % rows', c.table_name, c.column_name, n; end if;
  end loop;
end $$;
SQL
}

step_verify() {
  require_target_db
  info 'Row counts (source | target)'
  source_psql -c "$COUNT_SQL" > "$WORK_DIR/verify-source.txt"
  target_psql -c "$COUNT_SQL" > "$WORK_DIR/verify-target.txt"
  if diff "$WORK_DIR/verify-source.txt" "$WORK_DIR/verify-target.txt"; then
    info "Row counts match for $(wc -l < "$WORK_DIR/verify-target.txt") tables."
  else
    die 'row counts differ (see diff above)'
  fi

  old=$(env_value "$SOURCE_ENV_FILE" R2_PUBLIC_URL)
  remaining=$(target_psql <<SQL
select coalesce(sum((xpath('/row/c/text()', query_to_xml(format('select count(*) as c from public.%I where %I like %L', table_name, column_name, '%' || '${old#https://}' || '%'), false, true, '')))[1]::text::int), 0)
from information_schema.columns where table_schema = 'public' and data_type in ('text', 'character varying');
SQL
)
  [ "$remaining" = 0 ] || die "$remaining values still reference the old R2 URL; run rewrite-urls"
  info 'No R2 URL remains in the database.'

  manifest=$(ls -1t "$WORK_DIR"/r2-manifest-*.json 2>/dev/null | head -n 1)
  [ -n "$manifest" ] || die 'no R2 manifest; run copy-files'
  expected=$(grep -c '"key"' "$manifest")
  actual=$(docker run --rm -v "$FILES_VOLUME:/data/files:ro" --entrypoint sh "$ERP_IMAGE" -c 'find /data/files -type f | wc -l')
  [ "$expected" -le "$actual" ] || die "files volume has $actual files, R2 manifest lists $expected"
  info "Files volume has $actual files (R2 manifest: $expected)."
}

case "${1:-}" in
  dump) step_dump ;;
  restore) step_restore ;;
  copy-files) step_copy_files ;;
  rewrite-urls) step_rewrite_urls ;;
  verify) step_verify ;;
  *) die 'usage: migrate-data.sh dump|restore|copy-files|rewrite-urls|verify' ;;
esac
