#!/bin/bash
# services/backup/backup.sh
#
# One-shot backup: pg_dump -> gzip -> AES-256 encrypt -> upload to R2.
# Designed to be invoked by Railway cron. Exits non-zero on any failure
# so Railway logs the failure and can alert on it.

set -euo pipefail

# ─── Required env vars ──────────────────────────────────────────────────────
# DATABASE_URL              Set via ${{Postgres.DATABASE_URL}} in railway.toml
# BACKUP_ENCRYPTION_KEY     32+ char passphrase. Generate once, store in 1Password.
# R2_ACCESS_KEY_ID          From Cloudflare R2 → Manage R2 API Tokens
# R2_SECRET_ACCESS_KEY      Same
# R2_ENDPOINT               https://<account_id>.r2.cloudflarestorage.com
# R2_BUCKET                 e.g. xopure-twenty-backups
# RETENTION_DAYS            How many days of backups to keep (default: 30)
# ───────────────────────────────────────────────────────────────────────────

: "${DATABASE_URL:?DATABASE_URL is required}"
: "${BACKUP_ENCRYPTION_KEY:?BACKUP_ENCRYPTION_KEY is required}"
: "${R2_ACCESS_KEY_ID:?R2_ACCESS_KEY_ID is required}"
: "${R2_SECRET_ACCESS_KEY:?R2_SECRET_ACCESS_KEY is required}"
: "${R2_ENDPOINT:?R2_ENDPOINT is required}"
: "${R2_BUCKET:?R2_BUCKET is required}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

# Configure aws-cli for R2 (which is S3-compatible)
export AWS_ACCESS_KEY_ID="$R2_ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="$R2_SECRET_ACCESS_KEY"
export AWS_DEFAULT_REGION="auto"

TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
FILENAME="twenty-${TIMESTAMP}.sql.gz.enc"
S3_PATH="s3://${R2_BUCKET}/hourly/${FILENAME}"

echo "[$(date -u +%FT%TZ)] Starting backup → ${S3_PATH}"

# ─── 1. Dump, compress, encrypt, upload — all streamed, no temp files ──────
# Streaming avoids needing disk space equal to the DB size on the cron container.
# gpg uses AES-256 in CBC mode with a passphrase-derived key.
pg_dump --format=custom --no-owner --no-acl "$DATABASE_URL" \
  | gzip -9 \
  | gpg --batch --yes --symmetric --cipher-algo AES256 \
        --passphrase "$BACKUP_ENCRYPTION_KEY" \
  | aws s3 cp - "$S3_PATH" \
        --endpoint-url "$R2_ENDPOINT" \
        --expected-size 1073741824  # hint: 1GB, adjust upward as DB grows

echo "[$(date -u +%FT%TZ)] Upload complete"

# ─── 2. Prune old backups ──────────────────────────────────────────────────
# Cloudflare R2 supports lifecycle rules in the dashboard which is the
# preferred place to do this. This is a belt-and-suspenders fallback.
CUTOFF_EPOCH=$(date -u -d "${RETENTION_DAYS} days ago" +%s 2>/dev/null \
            || date -u -v-"${RETENTION_DAYS}"d +%s)

aws s3 ls "s3://${R2_BUCKET}/hourly/" --endpoint-url "$R2_ENDPOINT" \
  | awk '{print $1" "$2" "$4}' \
  | while read -r dt tm key; do
      [ -z "$key" ] && continue
      file_epoch=$(date -u -d "$dt $tm" +%s 2>/dev/null \
                || date -u -j -f "%Y-%m-%d %H:%M:%S" "$dt $tm" +%s 2>/dev/null \
                || echo 0)
      if [ "$file_epoch" -lt "$CUTOFF_EPOCH" ] && [ "$file_epoch" -gt 0 ]; then
        echo "Pruning old backup: $key (dated $dt)"
        aws s3 rm "s3://${R2_BUCKET}/hourly/${key}" --endpoint-url "$R2_ENDPOINT"
      fi
    done

echo "[$(date -u +%FT%TZ)] Backup job complete"
