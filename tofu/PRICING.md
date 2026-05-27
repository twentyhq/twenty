# Pricing Model — TOFU Twenty CRM Service

Concrete numbers for **our infra cost per client** and **what we charge clients**. Use this for proposals, SOWs, and margin analysis.

---

## Our Infra Cost Per Client

All figures in USD, monthly, as of April 2026.

### Tier 1 — Pilot / Small Client (1–5 users)

| Component | Service | Cost |
|---|---|---|
| Compute server | DO App Platform `basic-xs` (1GB RAM) | $12 |
| Compute worker | DO App Platform `basic-xxs` (512MB) | $5 |
| Postgres | Supabase Free tier | $0 |
| Redis | Upstash Free tier (500k cmds/mo) | $0 |
| Storage | Supabase Storage (included in Free) | $0 |
| DNS/TLS/CDN | Cloudflare Free | $0 |
| **Total infra** | | **$17/mo** |

**Caveat:** Supabase Free has no daily backups. Fine for first 30–60 days of a pilot. Must move to Pro before any real client data lands.

### Tier 2 — Production Small Client (5–25 users) — **OUR DEFAULT**

| Component | Service | Cost |
|---|---|---|
| Compute server | DO App Platform `basic-s` (2GB RAM) | $25 |
| Compute worker | DO App Platform `basic-xxs` (512MB) | $5 |
| Postgres | **Supabase Pro** (8GB DB, PITR, daily backups) | $25 |
| Redis | Upstash Fixed 250MB | $10 |
| Storage | Supabase Storage (included in Pro) | $0 |
| DNS/TLS/CDN | Cloudflare Free | $0 |
| Monitoring | Sentry (ships with Twenty) Free tier | $0 |
| **Total infra** | | **$65/mo** |

### Tier 3 — Active Client (25–100 users, heavy automation)

| Component | Service | Cost |
|---|---|---|
| Compute server | DO App Platform `basic-m` (4GB RAM, 2x instances) | $100 |
| Compute worker | DO App Platform `basic-xs` (1GB, 2x instances) | $24 |
| Postgres | Supabase Pro + larger compute (Medium) | $110 |
| Redis | Upstash Fixed 1GB | $20 |
| Storage | Supabase Storage overage (~50GB extra) | $10 |
| DNS/TLS/CDN | Cloudflare Pro ($20) | $20 |
| Monitoring | Sentry Team + Betterstack | $50 |
| **Total infra** | | **~$334/mo** |

### Tier 4 — Enterprise Client (100+ users, high availability)

| Component | Service | Cost |
|---|---|---|
| Compute server | DO App Platform `professional-s` (2 dedicated vCPU, 4GB, 3x instances) | $350 |
| Compute worker | DO App Platform `professional-xs` (2x instances) | $100 |
| Postgres | Supabase Team ($599) + Large compute | $900 |
| Redis | Upstash Fixed 5GB + Prod Pack | $250 |
| Storage | Supabase Storage with heavy usage | $50 |
| DNS/TLS/CDN | Cloudflare Business ($200) | $200 |
| Monitoring | Sentry Business + Datadog | $300 |
| **Twenty Enterprise license** (for SSO/RLS/audit) | ~$19/user × 100 users | $1,900 |
| **Total infra + license** | | **~$4,050/mo** |

---

## What We Charge Clients

### TOFU Offering Tiers

#### **Launch** — one-time $7,500 + $500/mo managed

- Fork, brand, deploy on DO App Platform + Supabase + Upstash
- 1–2 week turnaround
- Up to 5 users, up to 5 custom objects/fields
- Data migration from up to 1 source (CSV or simple HubSpot/Pipedrive export)
- 30 days of post-launch support included
- Then $500/mo for hosting + uptime monitoring + Twenty upstream updates

**Our margin:** $500 − $17 (Tier 1 infra) = **$483/mo margin (97%)**

#### **Custom Ops** — one-time $25,000–$50,000 + $2,500/mo managed

- Everything in Launch, plus:
- Unlimited custom objects, fields, views, workflows
- Up to 3 data migrations (CRM, billing, support tool)
- Integration setup: Slack, Gmail, LinkedIn, 1 custom API
- 2–3 custom React front components
- 2 custom TOFU apps from our `tofu-twenty-apps` library (e.g., pipeline scorer, outbound tracker)
- 60 days post-launch support
- Then $2,500/mo for managed ops + monthly feature work

**Our margin:** $2,500 − $65 (Tier 2 infra) = **$2,435/mo margin (97%)**

#### **Growth Partner** — $7,500/mo managed (6-month minimum)

- Everything in Custom Ops, plus:
- Quarterly GTM strategy reviews
- Dedicated TOFU engineer (fractional, ~1 day/week)
- AI agent tuning and custom skills
- Unlimited integrations and custom apps
- Weekly workflow automation updates
- Priority response (<4 hours business hours)

**Our margin:** $7,500 − $334 (Tier 3 infra) = **$7,166/mo margin (96%)**

#### **Enterprise** — $15,000–$30,000/mo (custom, 12-month minimum)

- Everything in Growth Partner, plus:
- HA deployment architecture (multi-region)
- SOC2/HIPAA compliance documentation
- Dedicated Slack channel with SLA
- Quarterly security reviews
- Twenty Enterprise license passthrough (SSO, RLS, audit logs)
- Named account team

**Our margin:** $15–30k − $4k (Tier 4 infra) = **$11–26k/mo margin (80–87%)**

---

## Implementation Fee Rationale

The one-time fees (Launch $7.5k, Custom Ops $25–50k) cover:

| Cost | Hours | Blended rate | Subtotal |
|---|---|---|---|
| Initial provisioning (all services, domain, DNS) | 3 | $250 | $750 |
| Branding (colors, logo, subdomain) | 2 | $250 | $500 |
| Custom object modeling + setup | 8 | $250 | $2,000 |
| Data migration (per source) | 4 | $250 | $1,000 |
| Integration setup (per integration) | 6 | $250 | $1,500 |
| Testing + QA | 4 | $250 | $1,000 |
| Client onboarding (training call, docs) | 3 | $250 | $750 |
| **Tier 1 Launch baseline** | ~24 | | **~$7,500** |

Tier 2 Custom Ops scales this to 80–150 hours depending on scope.

---

## Client Cost Comparison (What We Save Them)

**Illustrative 25-seat sales team moving from HubSpot Sales Hub Professional:**

| Tool | Price |
|---|---|
| HubSpot Sales Hub Professional | $90 per seat/mo × 25 seats = **$2,250/mo** |
| HubSpot annual contract commitment | $27,000/year |
| Custom object limits, automation caps, API limits | Constant friction |

**TOFU Custom Ops on Twenty:**

| Line item | Price |
|---|---|
| Our managed fee | $2,500/mo |
| Twenty Cloud Pro equivalent ($9/seat × 25) | Actually $0 — we're self-hosted |
| Infra passthrough (already in our fee) | — |
| Total to client | **$2,500/mo** |

**Same price, but:**
- No seat-based scaling pain (can go from 25 → 100 with no price jump from CRM licensing)
- No artificial caps on objects/automations/API calls
- Data ownership (client owns the Supabase instance)
- Custom React components, custom workflows, AI agents — all included
- TOFU as their extended ops team

Even at **half the price of HubSpot** ($1,250/mo), our margin is still ~95%. Pricing flexibility is the killer advantage.

---

## Annual vs Monthly

Default all recurring contracts to **annual prepaid** with a 10% discount:

- Growth Partner $7,500/mo → $81,000/year (vs $90k monthly)
- Custom Ops $2,500/mo → $27,000/year (vs $30k monthly)

Annual prepaid secures us 12 months of MRR upfront and reduces churn. Standard SaaS playbook.

---

## Commission/Referral Structure (for partners)

If another TOFU service partner sources the client:

- **10% of first 12 months** of managed fees (excluding implementation)
- Paid quarterly
- Capped at $25,000 per referral

---

## Margin Reality Check

| Tier | Monthly recurring | Infra cost | Gross margin | # needed to hit $50k MRR |
|---|---|---|---|---|
| Launch | $500 | $17 | 97% | 100 clients |
| Custom Ops | $2,500 | $65 | 97% | 20 clients |
| Growth Partner | $7,500 | $334 | 96% | 7 clients |
| Enterprise | $22,500 avg | $4,050 | 82% | 3 clients |

**Realistic mix to $50k MRR in year 1:** 3 Custom Ops + 5 Growth Partner = $57.5k MRR on ~8 clients. Very achievable given existing TOFU network.

---

## Things That Break This Model

Be honest about risks:

1. **Twenty changes its license** (AGPL → BSL, see FORK-MANAGEMENT.md for mitigation)
2. **Supabase price hike** — unlikely but possible; Neon is a ready substitute
3. **Client outgrows the model** and wants Salesforce-level features Twenty doesn't have. Our answer: "Twenty's not the right fit — let's find you one that is." We should not over-promise.
4. **Client data loss.** Absolutely must have PITR (Supabase Pro+) and offsite backups from day one. Budget 1 engineering day per quarter on backup verification drills.
5. **Twenty ships a breaking change.** We pin versions per client (see FORK-MANAGEMENT.md) and upgrade deliberately. Never auto-update production clients.

---

## What's NOT Included in Any Tier

Be explicit in SOWs:

- Third-party SaaS licenses clients pay directly (Slack, Google Workspace, Zapier, etc.)
- Twenty's Enterprise license fees (passed through at cost for Enterprise tier only)
- Custom backend services outside the Twenty ecosystem
- Paid data providers (Clay, Apollo, LinkedIn Sales Nav) — client's own accounts
- Client-initiated data loss recovery beyond our PITR window
