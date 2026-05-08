# services/backup/Dockerfile
#
# Hourly encrypted PostgreSQL backups → Cloudflare R2
#
# Why a custom service: Railway's native volume backups cover us if Railway
# itself is healthy, but we want OFF-PLATFORM, ENCRYPTED dumps so we can
# restore even if Railway has a bad day. This is our point-in-time-recovery
# stand-in.

FROM postgres:16-alpine

# aws-cli for R2 (R2 is S3-compatible), gnupg for AES-256 encryption.
# coreutils gives us reliable `date` formatting on alpine.
RUN apk add --no-cache aws-cli gnupg coreutils bash curl

WORKDIR /app

COPY backup.sh /app/backup.sh
RUN chmod +x /app/backup.sh

# Railway runs this as a cron service on the schedule defined in railway.toml.
# Each invocation does one backup and exits.
CMD ["/app/backup.sh"]
