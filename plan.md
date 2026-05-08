# XO Pure CRM Integration Plan

Last updated: 2026-05-07

## Objective

Build a production CRM at `crm.xopure.com` that runs Twenty on Railway, stores attachments and encrypted off-site backups in Cloudflare R2, and syncs XO Pure customer, ambassador, and related ecommerce data with Supabase.

The additions folder at `/Users/brians/Downloads/crm_xopure_additions` can be deleted only after its infra files, runbook content, environment inventory, and backup scripts are migrated into the main repo and verified.

## Checklist Status

- [x] Audit the installed Twenty CRM application.
- [x] Create repo knowledge documentation.
- [x] Create repo implementation plan.
- [x] Migrate additions infrastructure files into the main CRM repo.
- [x] Preserve and adapt additions README content.
- [x] Add deletion-readiness audit for `/Users/brians/Downloads/crm_xopure_additions`.
- [x] Add Railway service definitions for server, worker, and backup cron.
- [x] Add production env inventory for Railway, Cloudflare R2, SMTP, and backup secrets.
- [x] Add bootstrap script for XO Pure production secrets.
- [x] Correct backup restore docs for PostgreSQL custom-format dumps.
- [x] Add Supabase `crm_sync_map` migration with unique mapping constraints and RLS enabled.
- [x] Implement XO Pure CRM app package using Twenty SDK.
- [x] Implement core segmentation tags for customer, ambassador, prospects, order contacts, and commission contacts.
- [x] Implement ambassador level separation.
- [x] Implement CRM objects for customers, ambassadors, orders, and commissions.
- [x] Implement prospecting objects for retail prospects and influencer prospects.
- [x] Implement email sequence and automation trigger objects.
- [x] Implement enrichment task object.
- [x] Implement research/sequence skills and agents.
- [x] Implement initial sync/enrichment route stubs.
- [x] Validate XO Pure app lint.
- [x] Validate XO Pure app typecheck.
- [x] Validate XO Pure app build and tarball packaging.
- [x] Add Supabase env consistency check script.
- [ ] Confirm exact Supabase source table names and webhook payload shapes.
- [ ] Replace sync route stubs with concrete Supabase/Twenty upsert and backfill logic.
- [ ] Apply the Supabase migration to the production Supabase project.
- [ ] Provision/verify Railway production services.
- [ ] Provision/verify Cloudflare R2 buckets and DNS.
- [ ] Deploy Twenty to Railway.
- [ ] Install/deploy the XO Pure CRM app into the live Twenty workspace.
- [ ] Configure live email provider credentials and sequence bodies.
- [ ] Configure enrichment provider credentials and production enrichment actions.

## Current State

- Main app is a clean Twenty CRM monorepo in `/Users/brians/Documents/xopure_crm/Xopure_crm`.
- Additions folder contains an infra package, not Supabase sync code.
- Railway/R2 deployment assets from `xopure-twenty-infra.tar.gz` have been copied into the main repo.
- XO Pure-specific CRM data model has been implemented as `packages/twenty-apps/internal/xopure-crm`.
- Supabase sync foundation exists as `supabase/migrations/202605070001_create_crm_sync_map.sql`.
- Live Supabase sync implementation is still blocked on exact source table names and payload shapes.
- Current `.env` Supabase values are inconsistent: `CONNECTION_STRING` points to a different project ref than `VITE_SUPABASE_URL` / `VITE_SUPABASE_PROJECT_ID`.

## Guiding Decisions

1. Keep Twenty's internal Postgres separate from Supabase.
2. Sync through APIs and webhooks, not direct writes to Twenty internal tables.
3. Define XO Pure CRM schema as code where possible using a Twenty app package.
4. Make sync idempotent before adding automation polish.
5. Deploy server and worker from the same pinned Twenty image tag.
6. Treat Railway env vars and Cloudflare R2 credentials as production secrets; do not commit them.
7. Keep public signup disabled after the first admin exists.

## Phase 1: Migrate Infrastructure Assets

### Tasks

- [x] Extract `xopure-twenty-infra.tar.gz` into a temporary directory.
- [x] Copy `services/server`, `services/worker`, and `services/backup` into the main repo root.
- [x] Copy or merge `.env.example`, `setup.sh`, and `RUNBOOK.md` into the main repo.
- [x] Keep the repo-root docs from this audit: `knowledge.md` and `plan.md`.
- [x] Preserve additions README content as `docs/xopure-twenty-infra.md`.
- [x] Add additions deletion audit as `docs/additions-integration-audit.md`.
- [x] Confirm flattened duplicate files are represented under `services/*` or docs.

### Files To Add

- [x] `services/server/Dockerfile`
- [x] `services/server/railway.toml`
- [x] `services/worker/Dockerfile`
- [x] `services/worker/railway.toml`
- [x] `services/backup/Dockerfile`
- [x] `services/backup/backup.sh`
- [x] `services/backup/railway.toml`
- [x] `.env.xopure.example`
- [x] `RUNBOOK.md`

### Fixes While Migrating

- [x] In backup restore docs, clarify that the backup is a PostgreSQL custom-format dump after decrypt/gunzip and should be restored with `pg_restore`.
- [x] Ensure server and worker Dockerfiles use the same image tag.
- [ ] Re-check whether Railway should set `NODE_PORT=3000` or `NODE_PORT=${{PORT}}`/`PORT`; validate with an actual deploy because Railway routes to `$PORT`.
- [x] Keep root Twenty source `.env.example` separate from production Railway env docs by using `.env.xopure.example`.

### Acceptance Checks

- [x] `find services -maxdepth 3 -type f | sort` shows all three service folders.
- [x] `services/server/Dockerfile` and `services/worker/Dockerfile` pin the same `twentycrm/twenty` tag.
- [x] `services/backup/backup.sh` is executable.
- [x] `RUNBOOK.md` references paths that exist in this repo.

## Phase 2: Define Production Environment Inventory

### Railway Services

Create one Railway project named `xopure-crm` with:

- [ ] `twenty-server` web service.
- [ ] `twenty-worker` background service.
- [ ] `twenty-backup` cron service.
- [ ] Managed Postgres.
- [ ] Managed Redis.

### Cloudflare Resources

Create:

- [ ] DNS record `crm.xopure.com` pointing to Railway's CNAME target.
- [ ] R2 bucket `xopure-twenty-uploads` for attachments.
- [ ] R2 bucket `xopure-twenty-backups` for encrypted backup dumps.
- [ ] R2 API token scoped to both buckets.
- [ ] Lifecycle rule for backups, preferably delete after 90 days.

### Required Railway Variables

For `twenty-server`:

- [x] Document `PG_DATABASE_URL=${{Postgres.DATABASE_URL}}`
- [x] Document `REDIS_URL=${{Redis.REDIS_URL}}`
- [x] Document `APP_SECRET`
- [x] Document `SERVER_URL=https://crm.xopure.com`
- [x] Document `NODE_PORT=3000` or validated Railway port mapping value
- [x] Document `MESSAGE_QUEUE_TYPE=bull-mq`
- [x] Document `IS_SIGN_UP_DISABLED=true` after first admin creation
- [x] Document `SIGN_IN_PREFILLED=false`
- [x] Document `STORAGE_TYPE=s3`
- [x] Document `STORAGE_S3_REGION=auto`
- [x] Document `STORAGE_S3_NAME=xopure-twenty-uploads`
- [x] Document `STORAGE_S3_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com`
- [x] Document `STORAGE_S3_ACCESS_KEY_ID`
- [x] Document `STORAGE_S3_SECRET_ACCESS_KEY`
- [x] Document `EMAIL_*` SMTP variables
- [x] Document optional `SENTRY_DSN`

For `twenty-worker`:

- [x] Document same database, Redis, app secret, storage, email, and observability variables as server.
- [x] Document no public domain healthcheck required.

For `twenty-backup`:

- [x] Document `DATABASE_URL=${{Postgres.DATABASE_URL}}`
- [x] Document `BACKUP_ENCRYPTION_KEY`
- [x] Document `R2_ENDPOINT`
- [x] Document `R2_BUCKET=xopure-twenty-backups`
- [x] Document `R2_ACCESS_KEY_ID`
- [x] Document `R2_SECRET_ACCESS_KEY`
- [x] Document `RETENTION_DAYS=30` or chosen retention.

### Acceptance Checks

- [x] Railway variables use references for managed service URLs, not copied literal connection strings in docs.
- [ ] Redis `maxmemory-policy` is `noeviction` in production.
- [ ] First admin can log in.
- [ ] Public signup is disabled after admin creation.
- [ ] A contact persists after reload.
- [ ] A test attachment uploads to R2.
- [ ] First backup appears in R2 after 65 minutes.

## Phase 3: Design XO Pure CRM Data Model

### Recommended Minimum Schema

Use a Twenty app package to define custom schema. Suggested package path:

- [x] `packages/twenty-apps/internal/xopure-crm`

Objects and fields:

| Object/Field | Purpose |
|---|---|
| Person custom fields | Store Supabase/ecommerce customer identity, status, LTV, order count, tags, last order time, sync metadata. |
| `xopureAmbassador` | Dedicated ambassador lifecycle record linked to a person. |
| `xopureOrder` | Transactional order mirror linked to a person/customer. |
| `xopureOrderLine` | Optional item-level order detail. Not implemented yet because current request focused on order-level segmentation. |
| `xopureProduct` | Optional product mirror if users need catalog visibility. Not implemented yet. |
| `xopureCommission` | Ambassador commission/payout data. Implemented. |

### Data Modeling Rules

- [x] Use stable `universalIdentifier` values for app-defined objects and fields.
- [x] Start with fewer objects and add depth only when CRM users need it.
- [x] Keep raw external payloads out of primary CRM fields unless needed for debugging; store hashes or small references instead.
- [ ] Add relation fields after the live workspace metadata/API client confirms generated relation names.
- [x] Add `lastSyncedAt`, sync/source, or external IDs to synced objects where current source context is known.

### Acceptance Checks

- [x] CRM app defines customers, ambassadors, and order objects/views.
- [x] Ambassador records have clear status/tier/code fields.
- [ ] Sync code can upsert by external ID without duplicate CRM records.
- [x] Role exists for automation/app functions; production user roles still need live workspace configuration.

## Phase 4: Build Supabase Sync Foundation

### Supabase Migration

Create a Supabase migration for a private or appropriately secured sync map table.

- [x] Created `supabase/migrations/202605070001_create_crm_sync_map.sql`.
- [x] Added unique source mapping constraint.
- [x] Added unique Twenty mapping constraint.
- [x] Added retry/error tracking fields.
- [x] Added loop-prevention metadata with `last_written_by`.
- [x] Enabled RLS on the exposed `public.crm_sync_map` table.
- [ ] Apply migration to production Supabase after project credentials are available.

Implemented shape:

```sql
create table if not exists public.crm_sync_map (
  id uuid primary key default gen_random_uuid(),
  source_system text not null,
  source_table text not null,
  source_id text not null,
  twenty_object text not null,
  twenty_record_id text,
  sync_direction text not null default 'supabase_to_twenty',
  content_hash text,
  last_synced_at timestamptz,
  last_error text,
  retry_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_system, source_table, source_id),
  unique (twenty_object, twenty_record_id)
);
```

Security notes:

- [x] Enable RLS if the table is in an exposed schema.
- [x] Do not expose service-role operations to the browser.
- [ ] Prefer a private schema if only backend sync code needs access; current migration uses `public` with RLS because the existing additions concept named `crm_sync_map` without a private schema.

### Sync Handler Options

Option A: Vercel/Next.js sync layer in the main XO Pure website/API project.

- Pros: likely close to existing Supabase and site code.
- Cons: another system operates CRM sync; needs strict runbook coverage.

Option B: Twenty app logic functions under `/s/*`.

- Pros: sync code lives close to CRM schema and can use Twenty app permissions.
- Cons: Supabase service role and ecommerce integration secrets must be managed in Twenty app variables/runtime, and route availability must be tested on Railway.

Option C: Separate Railway sync worker/API service.

- Pros: same platform as CRM, strong operational isolation, can run backfills/cron.
- Cons: more service surface area.

Recommended initial path: build sync as a separate server-side API/worker module, either in the existing XO Pure web backend if it already owns Supabase, or as a new Railway service if this repo is intended to be self-contained. Avoid no-code workflows for core sync.

- [x] Added initial Twenty app route stub for `/s/xopure/sync/supabase`.
- [x] Added initial enrichment route stub for `/s/xopure/enrichment/tasks`.
- [x] Added payload normalization/validation to the sync and enrichment routes.
- [x] Added `scripts/xopure/check-supabase-env.sh` to verify Supabase env consistency without printing secrets.
- [ ] Confirm whether production sync will live in Twenty app logic functions, XO Pure web app, or a separate Railway service.

### Required Sync Endpoints/Jobs

- [ ] `POST /sync/supabase/customer` for Supabase customer webhook events.
- [ ] `POST /sync/supabase/ambassador` for ambassador webhook events.
- [ ] `POST /sync/supabase/order` for order webhook events.
- [ ] `POST /sync/twenty/webhook` for Twenty change events that should flow back to Supabase.
- [ ] `POST /sync/backfill?table=<name>` for controlled backfills.
- [ ] `GET /sync/health` for operational checks.
- [ ] Scheduled reconciliation job comparing recent updates and repairing drift.

### Acceptance Checks

- [x] Webhook shared-secret verification exists in the initial Twenty route stub.
- [ ] Duplicate webhook delivery does not create duplicate records.
- [ ] A changed Supabase customer updates the same Twenty person.
- [ ] A changed Twenty ambassador status updates the intended Supabase row if reverse sync is enabled.
- [x] Sync map migration supports failed sync attempts with errors and retry counts.
- [ ] Backfill can be run safely more than once.

## Phase 5: Implement Backfill

### Order Of Operations

1. [ ] Backfill people/customers first.
2. [ ] Backfill ambassadors and link to people.
3. [ ] Backfill orders and link to people.
4. [ ] Backfill order lines/products only if needed.
5. [ ] Backfill commissions/payouts only if ambassador ops requires it.
6. [ ] Run reconciliation and inspect duplicate candidates.
7. [ ] Enable live webhooks after backfill is clean.

### Acceptance Checks

- [ ] Counts match Supabase for each selected table.
- [x] Duplicate external IDs are supported by `crm_sync_map` constraints.
- [ ] Every synced Twenty record has an external ID and `lastSyncedAt`.
- [ ] A sample of high-value customers and active ambassadors matches source records.

## Phase 6: Configure Twenty Workflows And Webhooks

### Twenty Webhooks

Create webhooks for objects where changes should leave CRM:

- [ ] `person.created`, `person.updated` if CRM edits customer contact fields.
- [ ] `xopureAmbassador.created`, `xopureAmbassador.updated` for ambassador workflow/status changes.
- [ ] Optional order-related webhooks only if CRM users are allowed to edit order fields.

### Workflows

Recommended workflows after sync is stable:

- [ ] Notify team when a new ambassador application is created.
- [ ] Create a task when an ambassador reaches a revenue threshold.
- [ ] Create a follow-up task for VIP customers after high-value purchases.
- [ ] Alert when an order sync fails or ambassador data is stale.
- [ ] Periodically detect inactive ambassadors.

### Acceptance Checks

- [ ] Webhook delivery logs show successful events.
- [ ] Workflows do not recursively trigger sync loops.
- [ ] Workflow side effects are visible on records and assigned to correct users.

## Phase 7: Production Deploy On Railway

### Initial Deploy Sequence

1. [ ] Generate `APP_SECRET` and `BACKUP_ENCRYPTION_KEY`; store them in 1Password.
2. [ ] Create Cloudflare R2 buckets and API token.
3. [ ] Create Railway project and managed Postgres/Redis.
4. [ ] Deploy `twenty-server`.
5. [ ] Deploy `twenty-worker` after server healthcheck passes.
6. [ ] Deploy `twenty-backup` cron.
7. [ ] Configure `crm.xopure.com` CNAME to Railway target.
8. [ ] Create first admin account.
9. [ ] Disable public signup and redeploy/restart server.
10. [ ] Smoke test CRM, attachments, webhooks, and backup.

### Acceptance Checks

- [ ] `https://crm.xopure.com/healthz` returns healthy response or Railway healthcheck passes.
- [ ] Login works at `https://crm.xopure.com`.
- [ ] Worker logs show no queue connection errors.
- [ ] A test record created in the UI persists.
- [ ] A test webhook delivery succeeds.
- [ ] A backup object exists in `xopure-twenty-backups/hourly/`.

## Phase 8: Cloudflare Hardening

### Tasks

- [ ] Confirm DNS is proxied or DNS-only according to Railway's domain guidance.
- [ ] Add WAF/rate limiting only after login/API flows are tested.
- [ ] Restrict R2 API token scope to the exact buckets.
- [ ] Add lifecycle rule for backups.
- [x] Document bucket names, token owner, and rotation schedule in the runbook/docs.

### Acceptance Checks

- [ ] SSL is valid for `crm.xopure.com`.
- [ ] Attachments still upload/download after any Cloudflare proxy/WAF changes.
- [ ] Backup upload works after token scoping.

## Phase 9: Observability And Recovery

### Tasks

- [ ] Configure Sentry for Twenty server/worker if desired.
- [ ] Configure Railway alerts for service crashes and failed cron runs.
- [x] Add sync logs/error fields in `crm_sync_map`; structured runtime logging remains pending.
- [x] Create a quarterly restore drill procedure in docs.
- [x] Add a production smoke-test checklist to `RUNBOOK.md`.

### Recovery Test

- [ ] Download one encrypted R2 backup.
- [ ] Decrypt and gunzip it.
- [ ] Restore with `pg_restore` into a fresh non-production Postgres.
- [ ] Start a temporary Twenty server against the restored DB or inspect tables directly.
- [ ] Record restore duration and any errors.

## Phase 10: Delete Additions Folder

Only delete `/Users/brians/Downloads/crm_xopure_additions` after all criteria are met:

- [x] Main repo contains migrated `services/*` infra files.
- [x] Main repo contains updated runbook and env docs.
- [x] Backup script executable bit is preserved.
- [x] Docs fix the custom-format dump restore instruction.
- [x] Any unique content from additions has been copied or intentionally rejected.
- [x] Railway deploy has been queued with clear commands in `RUNBOOK.md` and `docs/xopure-twenty-infra.md`.
- [x] `knowledge.md` and `plan.md` are retained in the main repo.

## Risks And Mitigations

| Risk | Mitigation |
|---|---|
| Direct writes into Twenty internal DB break upgrades | Use Twenty REST/GraphQL/app SDK only. |
| Duplicate customer/ambassador records | Enforce external ID mapping and idempotent upsert. |
| Infinite sync loops | Add source markers and suppress echo events. |
| Public signup exposure | Set `IS_SIGN_UP_DISABLED=true` immediately after first admin. |
| Redis job loss | Set Redis `maxmemory-policy=noeviction`. |
| Backup unrecoverable | Store `BACKUP_ENCRYPTION_KEY` in 1Password and run restore drill. |
| Railway port mismatch | Validate server listens on Railway-injected port before production cutover. |
| Supabase secrets leak | Keep service-role keys server-only; never use `NEXT_PUBLIC_`. |
| RLS bypass through views/functions | Keep privileged functions in private schemas and enable RLS on exposed tables. |

## Immediate Next Actions

1. [x] Copy the archived `services/*` deployment structure into the main repo.
2. [x] Merge and correct the additions runbook into a repo-root `RUNBOOK.md`.
3. [x] Add initial Twenty app logic-function route stubs for sync/enrichment.
4. [x] Define the first XO Pure data model pass for customers and ambassadors.
5. [x] Create the Supabase `crm_sync_map` migration.
6. [ ] Implement a dry-run customer backfill before enabling live webhooks.

## Implementation Status: 2026-05-07

Completed in this repo:

- Migrated Railway service scaffolding from `crm_xopure_additions` into `services/server`, `services/worker`, and `services/backup`.
- Added `RUNBOOK.md`, `.env.xopure.example`, and `setup-xopure-crm.sh` for production deployment setup.
- Corrected R2 backup restore docs to restore the custom-format dump as `backup.pgdump` with `pg_restore`.
- Added `supabase/migrations/202605070001_create_crm_sync_map.sql` for idempotent Supabase/Twenty sync mapping.
- Added `packages/twenty-apps/internal/xopure-crm`, a deployable Twenty app defining XO Pure CRM schema, tags, prospecting databases, sequences, automation triggers, enrichment tasks, skills, agents, and webhook route stubs.

Validated:

- `yarn install` completed for the isolated XO Pure app.
- `yarn lint` passed for `packages/twenty-apps/internal/xopure-crm`.
- `yarn twenty typecheck .` passed for `packages/twenty-apps/internal/xopure-crm`.
- `npm_config_cache=/private/tmp/npm-cache-xopure yarn twenty build . --tarball` passed and produced `.twenty/output/xopure-crm-0.1.0.tgz`.
- `scripts/xopure/check-supabase-env.sh .env` ran and found a project-ref mismatch that blocks safe production Supabase migration/application.

Remaining implementation work:

- Fix `.env` so `CONNECTION_STRING`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_PROJECT_ID`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` all target the same Supabase project.
- Confirm actual Supabase source table names and payload shapes.
- Replace sync route stubs with concrete upsert/backfill logic.
- Apply the Supabase migration to the production Supabase project.
- Deploy Twenty to Railway and install/deploy the XO Pure CRM app to the live workspace.
- Connect production email provider credentials and define live email sequence bodies.
- Connect enrichment provider/API credentials and implement provider-specific enrichment actions.
