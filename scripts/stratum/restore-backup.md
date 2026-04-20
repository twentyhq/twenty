# Restoring a Twenty Postgres backup

Backups are written daily by the `twenty-db-backup` Railway service into the `twenty-backups` bucket of each environment. They are gzipped plain-SQL `pg_dump` files of the single `railway` database.

- Path: `s3://twenty-backups-<id>/twenty-backup/railway_<TIMESTAMP>.sql.gz`
- Format: `pg_dump railway | gzip` — restore with `gunzip | psql`
- Schedule: `0 2 * * *` UTC (daily at 02:00)
- Retention: governed by `BACKUP_KEEP_DAYS` (currently 30 in UAT; not set in prod — add it if needed)

## What's in the dump

A `pg_dump` of the `railway` DB captures **all Twenty data**:

- `core.*` schema — workspaces, users, feature flags, app metadata
- `metadata.*` schema — object/field/view/relation definitions
- `workspace_<uuid>.*` schemas — per-tenant business data (companies, people, opportunities, etc.)
- All indexes, constraints, sequences, functions

It does NOT capture: Postgres roles/users (managed by Railway), other databases on the cluster, cluster-level config. None of these are needed to restore a Twenty environment.

## 1. List and download a backup

From your laptop. Get bucket creds with `railway bucket credentials --bucket twenty-backups --environment <env> --json`.

```bash
export AWS_ACCESS_KEY_ID=<accessKeyId>
export AWS_SECRET_ACCESS_KEY=<secretAccessKey>
export AWS_DEFAULT_REGION=auto
S3='--endpoint-url=https://t3.storageapi.dev'

# UAT bucket: twenty-backups-78-ij6jf3c
# Prod bucket: twenty-backups-lkeipmiyo2

# list
aws $S3 s3 ls s3://twenty-backups-lkeipmiyo2/twenty-backup/

# download a specific dump
aws $S3 s3 cp s3://twenty-backups-lkeipmiyo2/twenty-backup/railway_2026-04-18T11:23:45Z.sql.gz ./restore.sql.gz
```

## 2. Sanity-check locally first (recommended)

Always verify a dump against a throwaway DB before restoring over a real one.

```bash
# spin up a temporary local Postgres
docker run -d --name pg-restore-test -e POSTGRES_PASSWORD=postgres -p 5433:5432 postgres:17

# load the dump
gunzip -c restore.sql.gz | psql "postgresql://postgres:postgres@localhost:5433/postgres"

# poke around
psql "postgresql://postgres:postgres@localhost:5433/postgres" -c "\dn"
psql "postgresql://postgres:postgres@localhost:5433/postgres" -c "select count(*) from core.workspace;"

# clean up
docker rm -f pg-restore-test
```

## 3. Restore into a Railway Postgres

The cleanest path is from a one-off shell on the `twenty-db-backup` container — it's already on the Railway private network and has the Postgres credentials and S3 creds in its env.

**This is destructive**: it drops and recreates the `railway` DB. Stop the `twenty` and `twenty-worker` services first so nothing is writing during the restore.

```bash
# 1. stop app services
railway service stop -s twenty             --environment <env>
railway service stop -s twenty-worker      --environment <env>

# 2. open shell in backup container and restore
railway ssh -s twenty-db-backup --environment <env> -- bash -c '
  apt-get update -qq && apt-get install -y -qq awscli postgresql-client
  export AWS_ACCESS_KEY_ID=$S3_ACCESS_KEY_ID
  export AWS_SECRET_ACCESS_KEY=$S3_SECRET_ACCESS_KEY
  export AWS_DEFAULT_REGION=$S3_REGION
  export PGPASSWORD=$POSTGRES_PASSWORD

  TS=2026-04-18T11:23:45Z   # <-- set this to the backup you want

  # drop and recreate the railway DB
  psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER -d postgres \
    -c "DROP DATABASE IF EXISTS railway;" \
    -c "CREATE DATABASE railway;"

  # stream the dump straight from S3 into psql
  aws --endpoint-url=$S3_ENDPOINT s3 cp \
    s3://$S3_BUCKET/twenty-backup/railway_${TS}.sql.gz - \
    | gunzip \
    | psql -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER -d railway
'

# 3. restart app
railway service start -s twenty            --environment <env>
railway service start -s twenty-worker     --environment <env>

# 4. flush metadata cache so the server re-reads from the restored DB
railway ssh --service twenty --environment <env> -- \
  "cd /app/packages/twenty-server && node dist/command/command.js cache:flush"

# 5. redeploy both so connection pools reset cleanly
railway redeploy -s twenty -y
railway redeploy -s twenty-worker -y
```

## 4. Restoring to a different environment (e.g. prod → UAT)

Useful for refreshing UAT with a recent prod snapshot.

1. Download the prod dump using prod bucket creds.
2. Upload to UAT bucket (or copy directly), or just stream prod-→ UAT psql from your laptop using both sets of creds.
3. Run step 3 above against the UAT environment.

After restoring prod data into UAT, re-point any environment-specific secrets (Resend keys, OAuth callbacks, etc.) since those values come over with the dump.
