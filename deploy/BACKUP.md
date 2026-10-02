# ERP Rehla — backup and restore

The ERP runs on the shared VPS in the rootless Docker daemon of user `deploy`.
Since the move off Vercel/Supabase/R2 the VPS holds the only live copy of the
data, so a daily encrypted backup goes to Google Drive.

## What is backed up

| Item | Source | Remote path |
| --- | --- | --- |
| Database | `pg_dump` of container `rehlatours-erp-legacy-postgres-1` | `db/YYYY/MM/rehla_erp-<stamp>.dump` |
| Uploaded files (KTP, passport, payment proof, PDFs) | volume `rehlatours-erp-legacy-files` | `files/` (mirror), `files-archive/<date>/` (changed or deleted files) |
| Env files | `legacy-erp.env`, `website.staging.env` | `config/env-<stamp>.tar` |
| Manifest | row counts, checksums, file count | `manifest/<stamp>.json` |

Remote: rclone crypt remote `rehla-backup:` on top of `gdrive:Rehlatours-Backup`
(Google account `rehlatours.id@gmail.com`, scope `drive.file`). File names and
contents are encrypted, so they look random in the Google Drive web UI.

Retention: every dump for 30 days, the dump of day 01 for 12 months,
`files-archive/` and `config/` for 90 days, local dumps on the VPS for 7 days.

## Where things live on the VPS

| Path | Purpose |
| --- | --- |
| `/home/deploy/rehlatours/shared/backup/backup.sh` | daily backup (copy of `deploy/backup/backup.sh`) |
| `/home/deploy/rehlatours/shared/backup/restore-test.sh` | restore proof (copy of `deploy/backup/restore-test.sh`) |
| `/home/deploy/rehlatours/shared/backups/` | local dumps, file mirror, `last-status` |
| `/home/deploy/.config/rclone/rclone.conf` | Drive token and encryption keys (mode 600) |
| `~/.config/systemd/user/rehlatours-backup.{service,timer}` | schedule: daily 18:30 UTC (01:30 WIB) |

The encryption passwords must also be stored outside the VPS (password
manager). Without them the Google Drive backup cannot be decrypted.

## Daily checks

```bash
cat /home/deploy/rehlatours/shared/backups/last-status
systemctl --user list-timers rehlatours-backup.timer
journalctl --user -u rehlatours-backup.service -n 40
```

A failed run sends a WhatsApp message to `WA_ADMIN_PHONE` through the ERP's
WAHA instance; a short confirmation is sent every Monday.

Run a backup by hand: `systemctl --user start rehlatours-backup.service`

## Monthly restore proof

```bash
/home/deploy/rehlatours/shared/backup/restore-test.sh
```

It downloads the newest dump from Google Drive, restores it into a throw-away
PostgreSQL container (no ports, no volume), compares every table's row count
with the manifest and decrypts one file. It must end with `RESTORE TEST PASSED`.
The live database is never touched.

## Disaster recovery (new server)

1. Install Docker (rootless for `deploy`) and rclone; recreate `rclone.conf`
   with the Drive login and the two saved encryption passwords
   (`rclone config`: a `drive` remote named `gdrive` with scope `drive.file`,
   and a `crypt` remote named `rehla-backup` on `gdrive:Rehlatours-Backup`).
2. Restore the env files: `rclone copy rehla-backup:config/<latest>.tar .` and
   unpack into `/home/deploy/rehlatours/shared/env/` (mode 600).
3. Check out this repository and start PostgreSQL:
   `docker compose --env-file $ERP_ENV_FILE -f deploy/compose.vps.yml up -d postgres`
4. Restore the database:
   ```bash
   rclone copy rehla-backup:db/YYYY/MM/rehla_erp-<stamp>.dump .
   docker exec -i rehlatours-erp-legacy-postgres-1 sh -c \
     'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists --no-owner --no-privileges --single-transaction --exit-on-error' \
     < rehla_erp-<stamp>.dump
   ```
5. Restore the files into the volume:
   ```bash
   rclone copy rehla-backup:files ./files
   docker volume create rehlatours-erp-legacy-files
   tar -C files -cf - . | docker run --rm -i -v rehlatours-erp-legacy-files:/data/files \
     --user 0 --entrypoint sh postgres:17.6-alpine -c 'tar -C /data/files -xf - && chown -R 1001:1001 /data/files'
   ```
6. Build and start the ERP: `docker compose ... up -d --build erp`, then point
   Nginx `erp.rehlatours.id` at `127.0.0.1:9300`.

## Restoring a single deleted file

Look in `rehla-backup:files-archive/<date>/` for the file and copy it back with
`rclone copyto`, then place it in the volume as in step 5.
