# CRM model v2 migration

Applies the CRM model agreed on 2026-10-28 (`skilland-dashboard/docs/CRM-MODEL.md`, section
"API contract") to the live Twenty CRM at `crm.skilland.ai`. The API names and select values in
`model.mjs` are a contract with the sales dashboard: don't rename them.

All writes go through Twenty's metadata REST API and the GraphQL API (never SQL), so the
metadata cache and views stay consistent. The script is idempotent: every step checks the current
state first, so re-running it after a partial failure only does what is still missing.

## Usage

```bash
export TWENTY_API_KEY=...            # TWENTY_BASE_URL defaults to https://crm.skilland.ai
node scripts/crm_model_v2/migrate.mjs --dry-run      # planned diff, no writes
VERBOSE=1 node scripts/crm_model_v2/migrate.mjs --dry-run   # also lists every deal patch
node scripts/crm_model_v2/migrate.mjs --apply
```

Take a database backup on the server first:

```bash
ssh ubuntu@63.178.36.56 'cd /opt/twenty && docker compose exec -T db pg_dump -U postgres -Fc default > backups/pre-crm-model-$(date +%H%M).dump'
```

## What it does (in order)

1. **Stage options, step 1**: adds `LEAD`, `QUALIFIED`, `PROPOSAL`, `NEGOTIATION`, `COMPLETED`
   next to the legacy values and sets Spanish labels, colors and positions.
2. **New fields**: opportunity `origen`, `financiacion`, `motivoPerdida` (SELECT), `fechaGanado`,
   `fechaRetomar` (DATE); company `tipoCliente` (SELECT).
3. **`campana` object** ("Campaña" / "Campañas") with `canal` TEXT, `fechaInicio`, `fechaFin` DATE,
   and many-to-one relations `opportunity.campana` and `person.campana` (reverse fields
   `campana.opportunities`, `campana.people`).
4. **Business lines**: renames Consultoría → Consulting, Plataforma → LMS, Bootcamps a particulares
   → Formación paquetizada, Formación a empresas → Formación a medida.
5. **Campaña records**: one per distinct non-empty `campaignName` on deals and people.
6. **Deals** (one update per record, grouped by identical patch):
   - stage per `STAGE_MAPPING`;
   - Microcredenciales deals → LMS;
   - `canal` → `origen` / `financiacion` per `CANAL_MAPPING` (only fills empty values);
   - lost IA Mujeres deals (name, `businessLineName` or `campaignName` contains "mujeres") →
     `motivoPerdida = CAMPANA_CERRADA`;
   - won deals with a `closeDate` and no `fechaGanado` → `fechaGanado = closeDate`;
   - `campana` from `campaignName`.
7. **People**: `campana` from `campaignName`.
8. **Companies**: `tipoCliente` by `classifyCompany()` in `model.mjs` (only where empty, so manual
   edits survive re-runs): B2G for public administrations and public bodies, B2C for the
   individuals listed in `B2C_NAMES`, B2B otherwise.
9. **Stage options, step 2**: refuses to continue if any deal is still on a legacy value, then
   removes the legacy options and sets the default to `LEAD`.
10. Soft-deletes the Microcredenciales business line once it has no deals.
11. Deactivates (doesn't delete) `canal` and the IA Mujeres / Gmail tracking fields on opportunity.
12. Prints stage and line distributions and the Formación a medida deals to review
    (medida vs paquetizada).

The TEXT import fields (`businessLineName`, `campaignName`, `organizationType`, `sourceType`, …)
are left untouched.

## Rollback

Restore the `backups/pre-crm-model-*.dump` taken before the run (`pg_restore --clean`), then
restart the server and worker containers so Twenty reloads its metadata cache.
