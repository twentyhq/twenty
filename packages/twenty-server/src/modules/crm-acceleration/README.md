# CRM Acceleration Module

## Implemented imperative features

- `#11` Data Quality Command Center (v1 rules-based)
- `#23` Email Sequences simulation
- `#25` Meeting Scheduler (round-robin)
- `#33` Pipeline Velocity Metrics
- `#40` Executive Real-Time Scorecard
- `#49` Multi-Pipeline Support summary
- `#50` Deal Rotation Warning
- `#59` Customer Health Score
- `#61` NPS / CSAT Automation plan
- `#62` Renewal Management plan
- `#85` MCP extension readiness + endpoint templates
- `#94` Field-level RBAC evaluation

## Pending structure

Pending modules and IDs are centralized in:

- `pending/crm-pending-modules.structure.ts`

This keeps the roadmap structured by module (M1-M11 + BONUS) with assigned execution phases.

## Persistence

Every execution of an implemented feature is persisted by workspace using core key-value storage:

- Last execution state per feature
- Execution history (up to 20 entries per feature)
- Workspace-level summary metadata

State endpoints:

- `GET /rest/crm-acceleration/features/states`
- `GET /rest/crm-acceleration/features/:featureId/state`
