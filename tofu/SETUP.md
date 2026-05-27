# Twenty CRM — Setup & Deployment (Alternatives)

> **Our canonical client deployment path is [DEPLOYMENT-DIGITALOCEAN.md](./DEPLOYMENT-DIGITALOCEAN.md)** (DO App Platform + Supabase + Upstash). This doc covers **alternatives** — local dev, raw Docker Compose, and other hosts — for when App Platform isn't the right fit.

Four paths documented here:

- **Path 0 — Local Sandbox** (fastest — just poking around, no Node setup needed)
- **Path A — Docker Compose** on any VPS (our fallback when a client needs SSH/a raw VM)
- **Path B — Local Development** (for hacking on Twenty core)
- **Path C — Managed host alternatives** (Railway, Hetzner)

---

## Path 0: Local Sandbox (Fastest — Just Experimenting)

**Use this when:** you want to try Twenty locally, explore the UI, test data models, or demo to someone. No Node.js setup, no compilation. Just Docker.

**Completed first-time setup on Brandon's machine (Apr 25 2026):**
- Docker Desktop installed via `brew install --cask docker`
- Node 24 installed via `brew install node@24` (needed only if building from source — not required for sandbox)
- Redis installed via `brew install redis` (only needed for Path B source builds — Docker Compose bundles its own)

### Start the sandbox

```bash
cd ~/Developer/tofu-twenty-crm/packages/twenty-docker
docker compose up -d
```

First boot takes ~60 seconds (pulls the image and runs DB migrations automatically). After that, subsequent starts are instant.

### Open the app

**http://localhost:3000** — create a workspace with your name/email on first visit.

### Where is the data stored?

All data lives in **Docker named volumes** on your local machine:

| Volume | What's in it | Location on disk |
|---|---|---|
| `twenty_db-data` | **All your CRM data** — contacts, companies, deals, workspaces, everything in Postgres | `/var/lib/docker/volumes/twenty_db-data/_data` (managed by Docker Desktop, not directly browsable) |
| `twenty_server-local-data` | File attachments uploaded through the UI | `/var/lib/docker/volumes/twenty_server-local-data/_data` |

**Important:** if you run `docker compose down -v` (note the `-v` flag) it **wipes everything**. Just `docker compose down` (no `-v`) stops containers but keeps your data.

### Daily commands

```bash
# Start
docker compose up -d

# Stop (keeps data)
docker compose down

# Check status
docker compose ps

# Watch server logs
docker compose logs -f server

# Wipe everything and start fresh (⚠️ deletes all data)
docker compose down -v && docker compose up -d
```

### Connect directly to Postgres (optional)

```bash
docker exec -it twenty-db-1 psql -U postgres -d default
```

### Stop Docker Desktop from running at login (since this is just a sandbox)

Docker Desktop → Settings → General → uncheck "Start Docker Desktop when you log in"

---

---

## Path A: Docker Compose (Fastest — Recommended for Client Deployments)

This spins up the full stack (Postgres + Redis + server + worker) in containers. Best for client production deployments.

### Prerequisites

- Docker Engine 20.10+
- Docker Compose v2
- 4GB RAM, 10GB disk minimum

### Steps

```bash
cd ~/Developer/tofu-twenty-crm/packages/twenty-docker

cp .env.example .env

# Generate a secret and set SERVER_URL
APP_SECRET=$(openssl rand -base64 32)
sed -i '' "s|# APP_SECRET=.*|APP_SECRET=${APP_SECRET}|" .env
sed -i '' "s|SERVER_URL=.*|SERVER_URL=http://localhost:3000|" .env

docker compose up -d

docker compose logs -f server
```

Once healthy, visit http://localhost:3000 and create the first workspace.

### Production Notes

- Change `SERVER_URL` to your real domain (e.g., `https://crm.clientname.com`)
- Put behind a reverse proxy (Caddy/Traefik/Nginx) for TLS
- Set `STORAGE_TYPE=s3` + S3 vars for file attachments (see below)
- Move Postgres and Redis to **managed services** for production (see [DATABASE.md](./DATABASE.md))

### S3 Storage (production)

```env
STORAGE_TYPE=s3
STORAGE_S3_REGION=us-east-1
STORAGE_S3_NAME=tofu-twenty-<client>
STORAGE_S3_ENDPOINT=           # leave blank for AWS, set for R2/Supabase/etc.
STORAGE_S3_ACCESS_KEY_ID=...
STORAGE_S3_SECRET_ACCESS_KEY=...
```

Works with AWS S3, Cloudflare R2, Supabase Storage (S3-compatible), or any S3-compatible provider.

---

## Path B: Local Development (for hacking on Twenty core or debugging)

Use this when you need to modify Twenty's core code. For just shipping clients, Path A is sufficient.

### Prerequisites

The project requires **Node ^24.5.0**. On Brandon's machine nvm couldn't download Node 24 (network issue), so we used Homebrew:

```bash
brew install node@24
export PATH="/opt/homebrew/opt/node@24/bin:$PATH"   # add this to ~/.zshrc permanently
node -v  # should show v24.x.x

corepack enable
corepack prepare yarn@4.13.0 --activate
```

You still need Postgres 16 and Redis running locally. Easiest: run just those two via Docker while the app runs on host:

```bash
cd ~/Developer/tofu-twenty-crm/packages/twenty-docker
docker compose up -d db redis
```

### Install & run

```bash
cd ~/Developer/tofu-twenty-crm

yarn install

cp packages/twenty-server/.env.example packages/twenty-server/.env
cp packages/twenty-front/.env.example packages/twenty-front/.env

yarn database:init:prod

yarn start
```

This runs server (port 3000) and front (port 3001) in dev mode with HMR. Full official guide: https://docs.twenty.com/developers/local-setup

---

## Path C: Deploy to a Managed Host (what we'll likely offer clients)

For production client instances, recommended stack:

### Option 1 — Railway (easiest, ~$20–50/mo per client)

1. Fork deploys directly — Railway detects Dockerfile in `packages/twenty-docker/twenty/`
2. Add Postgres + Redis addons from Railway marketplace
3. Set env vars per `.env.example`
4. Point client's custom domain

### Option 2 — DigitalOcean / Hetzner VPS (~$12–40/mo per client)

1. Provision Ubuntu 24.04 droplet (2GB+ RAM)
2. Install Docker + Docker Compose
3. Clone our fork, run Path A above
4. Add Caddy in front for auto-TLS:

```caddy
crm.clientname.com {
  reverse_proxy localhost:3000
}
```

### Option 3 — Vercel + External Postgres/Redis (advanced)

Twenty is NOT a Next.js app — it's a NestJS server + Vite React frontend. Vercel is not a natural fit. **Don't try to force this.** Use Railway or a VPS instead.

---

## Recommended Production Architecture for TOFU Clients

```
[Client's domain] → [Caddy/Cloudflare TLS]
                         ↓
              [Twenty server container]  ←→  [Redis (managed)]
              [Twenty worker container]  ←→  [Postgres (Supabase/Neon/RDS)]
                         ↓
                   [S3 / R2 bucket]
```

- Managed Postgres (Supabase, Neon, or RDS) → durability + backups for free
- Managed Redis (Upstash, Railway) → so we don't babysit it
- S3/R2 for file attachments
- Containers on Railway or a $12 Hetzner VPS
- Cloudflare in front for DDoS + TLS + caching

Total infra cost per client: **$15–60/mo**. Charge $3k–10k/mo for managed tier → margin is massive.

---

## Health Check

```bash
curl http://localhost:3000/healthz
```

Should return `200 OK` once the server finishes migrations on first boot (can take 60–90 seconds).

## Troubleshooting

| Symptom | Fix |
|---|---|
| Server crashes on start with "APP_SECRET" error | Generate with `openssl rand -base64 32` |
| Can't connect to DB | Check `PG_DATABASE_PASSWORD` has **no special characters** (known Twenty limitation) |
| Redis connection refused | Ensure Redis has `--maxmemory-policy noeviction` (BullMQ requirement) |
| Migrations fail | Set `DISABLE_DB_MIGRATIONS=true` on worker only; migrations must run on server |
| Enterprise feature locked | Expected — requires Twenty Organization plan license |
