# TOFU × Twenty CRM

This is TOFU's fork of [twentyhq/twenty](https://github.com/twentyhq/twenty), the open-source CRM we're evaluating as a productized service offering for clients.

## Why This Fork Exists

**Goal:** validate Twenty CRM as a deployable, customizable CRM that TOFU can fork-and-ship for clients looking to move off HubSpot, Salesforce, or Attio. This unlocks a new revenue stream:

- **Tier 1 — Launch:** fork, brand, deploy to client infra (1–2 week engagement)
- **Tier 2 — Custom Ops:** custom objects, workflows, migrations, integrations
- **Tier 3 — Managed:** ongoing hosting + feature work + AI agent tuning (recurring MRR)

We'll also apply to Twenty's [Partner Program](https://twenty.com/partners) once we've shipped one reference instance.

## Repository Layout

| Remote | URL | Purpose |
|---|---|---|
| `origin` | `github.com/bcharleson/tofu-twenty-crm` | Our fork — our changes go here |
| `upstream` | `github.com/twentyhq/twenty` | Twenty's official repo — we pull updates from here |

Current state: cloned from Twenty `v2.2.0` (main branch).

## License Awareness (READ THIS)

Twenty is **dual-licensed**:

1. **AGPL v3** — the core codebase (all files without an enterprise marker)
2. **Proprietary Enterprise** — files marked `/* @license Enterprise */` (SSO/SAML/OIDC, row-level permissions, audit logs, Stripe billing validity tokens)

### What this means for TOFU

| Activity | OK? |
|---|---|
| Self-host for a single client on their infra | Yes |
| Charge clients for deployment, customization, hosting, ongoing work | Yes (explicitly allowed by Twenty maintainers) |
| Build custom apps using `twenty-sdk` (our TOFU IP stays ours) | Yes — SDK apps are separately licensed consumers |
| Run a multi-tenant SaaS where we host many clients | **AGPL triggers** — we must publish modifications to the AGPL core to users. Mitigation: per-client deployments. |
| Enable SSO/RLS/audit-logs for a client | Client (or we) must pay Twenty's Organization plan ($19/user/mo cloud, or self-hosted Org license) |

**TOFU's operating rule:** keep all proprietary TOFU IP inside apps built against `twenty-sdk` (as a consumer), not as modifications to core files. This is the clean path to keep our sauce private.

## Quick Start

See the following docs in order of importance:

- **[DEPLOYMENT-DIGITALOCEAN.md](./DEPLOYMENT-DIGITALOCEAN.md)** — App Platform + Supabase path (alternative to droplet fleet)
- **[PRICING.md](./PRICING.md)** — CRM-only infra + pricing (App Platform model)
- **[DATABASE.md](./DATABASE.md)** — Postgres/Redis architecture, Supabase integration deep-dive
- **[SETUP.md](./SETUP.md)** — local dev environment + Docker Compose
- **[FORK-MANAGEMENT.md](./FORK-MANAGEMENT.md)** — upstream sync
- **[WHITE-LABEL.md](./WHITE-LABEL.md)** — branding patches, verify checklist, upstream merge notes
- **[UPSTREAM-SYNC.md](./UPSTREAM-SYNC.md)** — automated weekly sync PR workflow

**Full GTM Flywheel (product suite + rate card):** `~/Developer/tofu-brain/private/strategy/product/README.md`
**Droplet fleet ops:** `~/Developer/twenty-crm-launch`
**Business hub (iCloud):** `Top of Funnel/GTM-FLYWHEEL.md`

## Tech Stack (for reference)

- **Runtime:** Node.js 24.5+ (`.nvmrc`), Yarn 4
- **Monorepo:** Nx
- **Backend:** NestJS + BullMQ (Redis queues) + PostgreSQL 16
- **Frontend:** React + Jotai + Linaria + Lingui
- **Key packages in `packages/`:**
  - `twenty-server` — NestJS API
  - `twenty-front` — React app
  - `twenty-sdk` — **this is where our TOFU apps will be built against**
  - `twenty-docker` — Docker Compose, Helm, K8s configs
  - `create-twenty-app` — scaffolder for custom apps
  - `twenty-cli` — deployment CLI

## Strategic Architecture

```
Layer 3: tofu-twenty-apps (separate repo)   ← TOFU IP, vertical templates, AI agents
Layer 2: tofu-twenty-crm (this repo)        ← thin fork, white-label patches only
Layer 1: twentyhq/twenty (upstream)         ← free R&D, pull monthly
```

The fork stays **minimal** — only the changes that cannot live in an app (logo, per-user AI provider). All TOFU differentiation goes into apps built with `twenty-sdk`, which are proprietary consumers of the AGPL core. See [FORK-MANAGEMENT.md](./FORK-MANAGEMENT.md) for the full rationale.

## Next Steps

### Immediate (this sprint)
1. Deploy reference instance to `crm.topoffunnel.com` per [DEPLOYMENT-DIGITALOCEAN.md](./DEPLOYMENT-DIGITALOCEAN.md)
2. Validate end-to-end: create workspace, add objects, test workflows, verify backups
3. Apply to [Twenty Partner Program](https://twenty.com/partners) — free, do it now

### Short-term (first client)
4. Scaffold `tofu-twenty-apps` with `npx create-twenty-app` (separate repo, proprietary)
5. Build first vertical template (Agency CRM): custom objects, pipeline stages, email sequences
6. Deploy to first TOFU client and collect feedback → productize Launch tier per [PRICING.md](./PRICING.md)

### Medium-term (AI differentiation)
7. Implement per-user AI provider selection (ChatGPT OAuth, Ollama, BYOK) — see `AI-PROVIDER-STRATEGY.md` (to be written)
8. Attempt to upstream the AI provider feature to `twentyhq/twenty`; if accepted, we drop the maintenance burden
