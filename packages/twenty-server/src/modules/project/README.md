# Project Management

Deal-linked project management with task dependencies, RACI matrices, milestones, and progress tracking.

## Entities
- `ProjectEntity` — dealId, accountId, name, status (planning/active/on_hold/completed/cancelled), startDate, endDate, budget, progress
- Task entities with dependency types (finish_to_start/start_to_start/finish_to_finish)
- RACI role assignments (Responsible/Accountable/Consulted/Informed)

## Service Methods
- `ProjectService` — creates projects from closed deals, manages tasks with dependencies, assigns RACI roles, tracks milestones and progress, calculates project health

## Feature Flag
`IS_MODULE_PROJECT_ENABLED`

## Dependencies
- None
