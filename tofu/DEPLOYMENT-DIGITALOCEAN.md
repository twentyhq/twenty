# Production Deployment — DigitalOcean App Platform + Supabase + Upstash

This is TOFU's **canonical client deployment stack** for Twenty CRM.

## Stack Summary

| Layer | Service | Why |
|---|---|---|
| **Compute** | DigitalOcean App Platform | Managed containers, git-based deploys, we already use DO |
| **Postgres** | Supabase Pro | Better price/perf than DO Managed DB, our existing playbook, includes Storage |
| **Redis** | Upstash | Serverless Redis, cheap, perfect for Twenty's BullMQ workload |
| **Object storage** | Supabase Storage (S3-compatible) | Same project as Postgres, one vendor for data |
| **TLS / DNS / CDN** | Cloudflare | Free tier, TLS, DDoS, DNS |
| **Monitoring** | DO built-in + Sentry (ships with Twenty) | No extra setup |
| **Organization** | DigitalOcean **Projects** | One project per client (grouping of App + domain + billing view) |

## Architecture

```
Client's domain (crm.clientname.com)
        ↓ Cloudflare (TLS + DDoS)
        ↓
[DO App Platform App]
  ├─ Service: twenty-server (port 3000, 1-2 instances)
  └─ Worker:  twenty-worker (no port, 1 instance)
        ↓                              ↓
[Supabase Postgres]              [Upstash Redis]
[Supabase Storage (S3)]
```

Each client gets their own isolated: DO App, Supabase project, Upstash database, Cloudflare DNS record.

---

## About SSH — Important Expectation Setting

You mentioned managing via SSH. **DO App Platform does NOT give persistent SSH** the way a Droplet does. It's a managed PaaS — think Heroku, not AWS EC2.

What you **do** get with App Platform:

| Capability | How |
|---|---|
| Shell into a running container | `doctl apps console <app-id> --component server` |
| View live logs | `doctl apps logs <app-id> --follow` or DO dashboard |
| Exec one-off commands | `doctl apps tier instance exec ...` |
| Redeploy on git push | Automatic |
| Roll back | DO dashboard or CLI |
| Scale up/down | Edit app spec, instant |

**When that's enough:** 95% of client deployments. You shouldn't need to live-edit files on a server for a managed CRM instance.

**When you'd want a Droplet instead:**
- Client demands direct server access (uncommon)
- You need to run custom system-level services alongside Twenty
- Cost at very large scale (hosting 20+ clients on one Droplet, see [FORK-MANAGEMENT.md](./FORK-MANAGEMENT.md) for that pattern)

For those cases, use a **$12 Basic Droplet** with Docker Compose instead of App Platform. Same Supabase + Upstash stack, just a VM underneath. Covered at the bottom of this doc.

---

## What is Upstash? (Explainer for Team)

**Upstash is serverless managed Redis.** Think of it like AWS Lambda but for Redis — you get a Redis endpoint, pay per command or by fixed tier, and never touch server ops.

### Why we need it for Twenty

Twenty uses **BullMQ** for background job processing (email sync, calendar sync, workflow execution, AI agent runs). BullMQ requires Redis with `--maxmemory-policy noeviction`. We have three options:

1. Self-host Redis on a Droplet — **rejected** (pager risk, no PITR, scaling is manual)
2. DO Managed Redis — **$15/mo minimum for 1GB, overkill for Twenty's actual usage**
3. **Upstash** — serverless, scales to zero, usually $0–10/mo in real usage

### Upstash pricing (current as of April 2026)

| Plan | Price | Good for |
|---|---|---|
| **Free** | $0 | 500k commands/month, 256MB storage, 10GB bandwidth — fine for pilots and small clients |
| **Pay-as-you-go** | $0.20 per 100k commands | Most clients, predictable small workloads |
| **Fixed 250MB** | $10/mo | Production floor, unlimited commands within the tier |
| **Fixed 1GB** | ~$20/mo | Active clients with lots of workflow automation |
| **Prod Pack add-on** | $200/mo | Enterprise only — adds SLA, SOC-2, monitoring |

**Twenty's actual Redis usage profile:** light. Queues hold jobs transiently, session tokens expire fast, caching is minimal. Most clients sit comfortably on **Free tier or $10 Fixed**. A very active 20-user client with heavy automation might hit $20–30/mo.

### How Upstash pricing works in practice

Upstash databases have two modes:
- **Regional** (cheaper, single AWS region) — use this for Twenty
- **Global** (multi-region replicated) — unnecessary for a CRM in one region

Pick the AWS region closest to the DO App Platform region. Example: DO `nyc3` → Upstash `us-east-1`.

### Upstash vs Redis Cloud vs Railway Redis

- **Upstash:** best for TOFU (serverless, cheapest at small scale, good DX)
- **Redis Cloud:** runs by the Redis company, more expensive, more features
- **Railway Redis:** fine if we were on Railway; we're not

---

## Provisioning Playbook (one-time per client)

### Prerequisites

```bash
brew install doctl supabase/tap/supabase
doctl auth init
```

### Step 1 — Create a DO Project for the client

From [DO dashboard](https://cloud.digitalocean.com/projects) or CLI:

```bash
doctl projects create \
  --name "TOFU CRM - <ClientName>" \
  --description "Twenty CRM instance for <ClientName>" \
  --purpose "Service or API"
```

This gives you clean billing and resource grouping per client.

### Step 2 — Provision Supabase project

1. Go to [supabase.com/dashboard/new](https://supabase.com/dashboard/new)
2. Org: TOFU (or a client-specific org if billed separately)
3. Name: `tofu-crm-<clientname>`
4. Region: **same as DO region** (e.g., `us-east-1` for `nyc3`)
5. Plan: start **Free**, upgrade to **Pro ($25/mo)** before client go-live for daily backups + PITR
6. Save the generated DB password securely (1Password vault)

Then grab the **session pooler connection string** (Project Settings → Database → Connection string → Session mode, port 5432).

### Step 3 — Provision Upstash Redis

1. Go to [console.upstash.com](https://console.upstash.com)
2. Create Database → Regional → same AWS region as Supabase
3. Eviction: **Set `noeviction` policy** (Settings → Eviction Policy) — **critical for BullMQ**
4. Start on **Pay-as-you-go** or **Free**; upgrade later if usage grows
5. Copy the connection string (use the TLS one, `rediss://...`)

### Step 4 — Create the DO App Platform app

Create `do-app-spec.yaml` in the `tofu/` folder (template provided at the bottom of this doc). Then:

```bash
doctl apps create --spec tofu/do-app-spec.yaml --project-id <project-id-from-step-1>
```

### Step 5 — Set environment variables

Via dashboard or CLI. The critical ones:

```
APP_SECRET=<openssl rand -base64 32>
PG_DATABASE_URL=postgresql://postgres.<ref>:<pass>@aws-0-<region>.pooler.supabase.com:5432/postgres
REDIS_URL=rediss://default:<token>@<endpoint>.upstash.io:6379
SERVER_URL=https://crm.<clientname>.com
STORAGE_TYPE=s3
STORAGE_S3_REGION=<supabase-region>
STORAGE_S3_NAME=twenty-<clientname>
STORAGE_S3_ENDPOINT=https://<supabase-ref>.supabase.co/storage/v1/s3
STORAGE_S3_ACCESS_KEY_ID=<from supabase storage S3 settings>
STORAGE_S3_SECRET_ACCESS_KEY=<from supabase storage S3 settings>
```

Mark all secrets as `SECRET` type (encrypted at rest in DO).

### Step 6 — First boot

The server container runs migrations automatically on first boot. Takes 60–90 seconds. Watch:

```bash
doctl apps logs <app-id> --component server --follow
```

Once you see `Nest application successfully started`, visit `https://<default-ondigitalocean-url>` to create the admin workspace.

### Step 7 — Custom domain + Cloudflare

1. DO App Platform → Settings → Domains → Add `crm.<clientname>.com`
2. Cloudflare DNS: add CNAME pointing to the DO app URL
3. Cloudflare SSL/TLS mode: **Full (strict)**
4. Update Twenty's `SERVER_URL` env var to the custom domain

### Step 8 — Post-deploy checklist

- [ ] Supabase PITR enabled (Pro plan required)
- [ ] Upstash eviction policy is `noeviction`
- [ ] Cloudflare DNS propagated and TLS works
- [ ] Test workspace created and a company record added
- [ ] Admin user invited (client's point person)
- [ ] Client credentials stored in our password vault
- [ ] Alerting: DO App Platform → Settings → Alerts → 5xx, restart loop, deploy failure
- [ ] Monthly recurring billing configured in our CRM (how fitting)

---

## DO App Spec Template

Save this as `tofu/do-app-spec.yaml` and `sed` the `<client>` placeholders per deployment.

```yaml
name: tofu-twenty-<client>
region: nyc

services:
  - name: server
    image:
      registry_type: DOCKER_HUB
      registry: twentycrm
      repository: twenty
      tag: v2.2.0
    instance_size_slug: basic-xs
    instance_count: 1
    http_port: 3000
    health_check:
      http_path: /healthz
      initial_delay_seconds: 60
      period_seconds: 10
    envs:
      - { key: NODE_PORT, value: "3000" }
      - { key: SERVER_URL, value: https://crm.<client>.com }
      - { key: APP_SECRET, value: ${APP_SECRET}, type: SECRET }
      - { key: PG_DATABASE_URL, value: ${PG_DATABASE_URL}, type: SECRET }
      - { key: REDIS_URL, value: ${REDIS_URL}, type: SECRET }
      - { key: STORAGE_TYPE, value: s3 }
      - { key: STORAGE_S3_REGION, value: us-east-1 }
      - { key: STORAGE_S3_NAME, value: twenty-<client> }
      - { key: STORAGE_S3_ENDPOINT, value: https://<ref>.supabase.co/storage/v1/s3 }
      - { key: STORAGE_S3_ACCESS_KEY_ID, value: ${S3_KEY}, type: SECRET }
      - { key: STORAGE_S3_SECRET_ACCESS_KEY, value: ${S3_SECRET}, type: SECRET }

workers:
  - name: worker
    image:
      registry_type: DOCKER_HUB
      registry: twentycrm
      repository: twenty
      tag: v2.2.0
    instance_size_slug: basic-xxs
    instance_count: 1
    run_command: yarn worker:prod
    envs:
      - { key: PG_DATABASE_URL, value: ${PG_DATABASE_URL}, type: SECRET }
      - { key: REDIS_URL, value: ${REDIS_URL}, type: SECRET }
      - { key: APP_SECRET, value: ${APP_SECRET}, type: SECRET }
      - { key: DISABLE_DB_MIGRATIONS, value: "true" }
      - { key: DISABLE_CRON_JOBS_REGISTRATION, value: "true" }
      - { key: STORAGE_TYPE, value: s3 }
      - { key: STORAGE_S3_REGION, value: us-east-1 }
      - { key: STORAGE_S3_NAME, value: twenty-<client> }
      - { key: STORAGE_S3_ENDPOINT, value: https://<ref>.supabase.co/storage/v1/s3 }
      - { key: STORAGE_S3_ACCESS_KEY_ID, value: ${S3_KEY}, type: SECRET }
      - { key: STORAGE_S3_SECRET_ACCESS_KEY, value: ${S3_SECRET}, type: SECRET }

domains:
  - domain: crm.<client>.com
    type: PRIMARY
```

---

## DO App Platform Instance Sizes for Twenty

| Size | vCPU | RAM | Price | When to use |
|---|---|---|---|---|
| `basic-xxs` | 1 shared | 512MB | $5/mo | **Worker only** (fine — worker is light) |
| `basic-xs` | 1 shared | 1GB | $12/mo | **Server, pilot stage** (<5 users) |
| `basic-s` | 1 shared | 2GB | $25/mo | **Server, production floor** (5–20 users) |
| `basic-m` | 2 shared | 4GB | $50/mo | **Server, active clients** (20–50 users) |
| `professional-xs` | 1 dedicated | 1GB | $29/mo | Enterprise client who wants guaranteed CPU |

**TOFU default for a new client: `basic-s` server + `basic-xxs` worker = $30/mo compute.**

---

## Shell Access Cheat Sheet (the "SSH alternative")

```bash
doctl apps list

doctl apps console <app-id> --component server

doctl apps logs <app-id> --component server --follow

doctl apps create-deployment <app-id>

doctl apps get-deployment <app-id> <deployment-id>
```

For `docker exec`-style debugging of the database:

```bash
supabase login
supabase db reset --project-ref <ref>

psql "$PG_DATABASE_URL"
```

---

## Alternative: DO Droplet + Docker Compose (when you really do want SSH)

If a client or engagement calls for full SSH access:

```bash
doctl compute droplet create tofu-twenty-<client> \
  --size s-2vcpu-2gb \
  --image docker-20-04 \
  --region nyc3 \
  --ssh-keys <your-key-id>

ssh root@<droplet-ip>
git clone https://github.com/bcharleson/tofu-twenty-crm.git
cd tofu-twenty-crm/packages/twenty-docker
```

Follow [SETUP.md](./SETUP.md) Path A from there, but override the DB/Redis env vars to point to Supabase + Upstash instead of the bundled containers (comment out `db` and `redis` services in `docker-compose.yml`).

Add Caddy in front for auto-TLS:

```caddy
crm.<client>.com {
  reverse_proxy localhost:3000
}
```

**When this makes sense:** rarely. Only if (a) client insists, (b) we're consolidating 10+ clients on one large Droplet for cost reasons, or (c) we need non-Twenty system services alongside.

---

## See Also

- [PRICING.md](./PRICING.md) — concrete cost breakdown per client + our proposed client pricing tiers
- [DATABASE.md](./DATABASE.md) — deep dive on Postgres/Redis/Storage architecture and gotchas
- [FORK-MANAGEMENT.md](./FORK-MANAGEMENT.md) — keeping our fork in sync with upstream Twenty
