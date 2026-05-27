# Database Architecture & Supabase Integration

This covers the answer to: **"what database do I need, how is it structured out of the box, and how does Supabase fit in?"**

---

## Out-of-the-Box Architecture

Twenty needs **two** datastores:

### 1. PostgreSQL 16 — primary durable store

Holds:
- Workspace metadata (which objects/fields/views exist)
- All CRM data (companies, people, opportunities, custom objects)
- User/auth tables
- Workflow definitions
- File metadata (actual binaries go to S3/local disk)

**Default docker-compose config** (`packages/twenty-docker/docker-compose.yml`):
- Image: `postgres:16`
- DB name: `default` (not `twenty` as older docs say)
- User: `postgres`
- Connection string: `postgres://postgres:<password>@db:5432/default`

Overridable via env:
```env
PG_DATABASE_USER=postgres
PG_DATABASE_PASSWORD=<strong-password-no-special-chars>
PG_DATABASE_HOST=db
PG_DATABASE_PORT=5432
```

Or override the whole URL:
```env
PG_DATABASE_URL=postgres://user:pass@host:5432/dbname
```

Known constraint: the password **cannot contain special characters** (backslash, `@`, `:`, etc.). Twenty parses the URL naively. Use hex or alphanumeric.

### 2. Redis 7 — queues + cache + sessions

Used by **BullMQ** for:
- Background worker jobs (email sync, calendar sync, workflow execution, AI agent runs)
- Session storage
- Rate limiting

**Critical config:** must run with `--maxmemory-policy noeviction` or BullMQ jobs get silently dropped.

```env
REDIS_URL=redis://redis:6379
```

### 3. Object storage (optional, needed for file attachments)

- `STORAGE_TYPE=local` → saved to `/app/packages/twenty-server/.local-storage` in the container (ephemeral unless you mount a volume)
- `STORAGE_TYPE=s3` → any S3-compatible bucket (AWS S3, R2, Supabase Storage, Backblaze B2)

---

## Can We Use Supabase? — Yes, With Caveats

**Short answer:** yes for the Postgres layer. No for the Redis layer (Supabase doesn't offer Redis). Supabase Storage works fine for the S3 layer.

### Recommended TOFU/Client Supabase Setup

```
Supabase Postgres  →  Twenty's PG_DATABASE_URL
Upstash Redis      →  Twenty's REDIS_URL
Supabase Storage   →  Twenty's S3 vars (S3-compatible mode)
```

All managed, all cheap, zero server babysitting.

### How to Wire It Up

**Step 1 — Supabase project**

Create a new Supabase project. Give Twenty its own dedicated schema to avoid colliding with Supabase's managed schemas (`auth`, `storage`, `realtime`, `extensions`, `_analytics`, `_supavisor`).

From Supabase SQL editor:

```sql
-- Create a dedicated user + database for Twenty
-- Safer than using the default postgres role
CREATE USER twenty_app WITH PASSWORD 'CHANGE_ME_HEX_PASSWORD';
CREATE DATABASE twenty_production OWNER twenty_app;
GRANT ALL PRIVILEGES ON DATABASE twenty_production TO twenty_app;
```

(Or use the default `postgres` role if you don't care about isolation — single-tenant per-client deploys typically don't.)

**Step 2 — Get the pooled connection string**

In Supabase dashboard → Project Settings → Database → Connection string → **Transaction pooler** (port 6543) or **Session pooler** (port 5432).

For Twenty, use the **session pooler (port 5432)** because Twenty uses long-lived transactions and connection-level settings that don't play nice with transaction pooling.

```env
PG_DATABASE_URL=postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres
```

Or if connecting directly (not via pooler):

```env
PG_DATABASE_URL=postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres
```

**Step 3 — Extension check**

Twenty needs standard Postgres extensions. The old `pg_graphql` requirement was **removed in v0.31.0** (replaced with a custom ORM), so that's no longer a blocker. Supabase comes with what Twenty needs out of the box.

Twenty will auto-run its migrations on first boot. If you see migration errors about schemas, pre-create:

```sql
CREATE SCHEMA IF NOT EXISTS core;
CREATE SCHEMA IF NOT EXISTS metadata;
```

**Step 4 — Redis (Supabase doesn't have it — use Upstash)**

Upstash free tier gives 10k commands/day. Production needs paid (~$10/mo).

```env
REDIS_URL=rediss://default:<token>@<endpoint>.upstash.io:6379
```

Note `rediss://` (TLS) for Upstash.

**Step 5 — Storage via Supabase S3-compatible mode**

Supabase Storage exposes S3 API. In Supabase dashboard → Storage → S3 Connection.

```env
STORAGE_TYPE=s3
STORAGE_S3_NAME=twenty-<client>
STORAGE_S3_REGION=<supabase-region>
STORAGE_S3_ENDPOINT=https://<project-ref>.supabase.co/storage/v1/s3
STORAGE_S3_ACCESS_KEY_ID=<from-supabase-s3-settings>
STORAGE_S3_SECRET_ACCESS_KEY=<from-supabase-s3-settings>
```

---

## Should We Actually Use Supabase? — Trade-off Analysis

| Factor | Supabase | Neon | RDS | Self-hosted Postgres |
|---|---|---|---|---|
| Setup time | 5 min | 3 min | 30 min | 20 min |
| Cost (small client, <10GB) | $0–25/mo | $0–19/mo | $15–50/mo | ~$12 VPS |
| Backups | Automatic PITR | Automatic PITR | Automatic | Manual |
| Branching (dev/staging) | Yes | Yes (best-in-class) | Manual | Manual |
| Bundled Storage | Yes (S3 API) | No | S3 separate | None |
| Bundled Redis | **No** | No | ElastiCache separate | None |
| Connection pooling | Yes (PgBouncer/Supavisor) | Yes | RDS Proxy (paid) | Manual |

**TOFU's verdict:**

- **Use Supabase** when the client is already a Supabase shop (most of our network is) or wants bundled storage + Postgres in one vendor.
- **Use Neon** when you want best-in-class database branching for dev/staging environments or cheaper baseline pricing.
- **Use the bundled Docker Postgres** when we're doing a quick proof-of-concept or pilot (`docker compose up -d` and you're done).
- **Always use Upstash Redis** (or Railway Redis) separately — don't self-host Redis for clients.

---

## Default TOFU Client Deployment Stack (my recommendation)

```
Container host:  Railway or Hetzner VPS ($12–25/mo)
Postgres:        Supabase (matches our existing playbook)
Redis:           Upstash ($10/mo)
Storage:         Supabase Storage (same project as Postgres)
TLS/CDN:         Cloudflare (free tier)
Monitoring:      Railway built-in + Sentry (already in Twenty)
```

**Total infra per client: $25–50/mo**. Sell managed tier at $3k–10k/mo → 60–100x markup. This is the flywheel economics.

---

## Running Migrations

On the **first boot**, the Twenty server container runs all migrations against the connected Postgres automatically. You don't need to do anything manual.

To disable on subsequent boots (after the schema is stable):

```env
DISABLE_DB_MIGRATIONS=true   # on server
DISABLE_DB_MIGRATIONS=true   # always true on worker (it's set this way by default)
```

To re-run migrations manually:

```bash
docker compose exec server yarn database:migrate
```

---

## Backup Strategy per Client

- **Supabase/Neon/RDS** — automatic PITR, nothing to do
- **Self-hosted Docker Postgres** — daily `pg_dump` to S3 via cron:

```bash
0 3 * * * docker exec twenty-db-1 pg_dump -U postgres default | gzip | \
  aws s3 cp - s3://tofu-backups/<client>/twenty-$(date +\%F).sql.gz
```

---

## Supabase Known Gotchas for Twenty

1. **Password rules:** Twenty's URL parser chokes on special characters. Use hex or alphanumeric passwords only. Supabase's generated default should be fine; any custom password must avoid `@`, `:`, `/`, `\`.
2. **Transaction pooler (port 6543) is NOT safe for Twenty.** Use session pooler (port 5432) or direct connection. Twenty uses features that require connection-level state.
3. **SSL required:** Supabase enforces TLS. Twenty respects `?sslmode=require` in the URL if needed; usually not required because the default is to trust TLS from managed providers.
4. **Connection limits:** Supabase free tier has 60 connections via pooler. A single Twenty server + worker uses ~20. Plenty of room for a small client; upgrade to Pro ($25/mo) for larger deployments.
5. **Schemas:** Twenty creates its own schemas (`core`, `metadata`, plus per-workspace schemas). Don't let it run as the `postgres` superuser in the long term — create a restricted role.
