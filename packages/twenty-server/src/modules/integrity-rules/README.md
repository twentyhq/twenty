# Integrity rules

Declarative data rules enforced server-side on every `createOne`, `createMany`, `updateOne` and `updateMany`, for GraphQL and REST alike (wildcard pre-query hooks).

## Adding a rule

Add it to `constants/<object>-integrity-rules.constant.ts` and spread that list into `INTEGRITY_RULES`. Rules use field names, not column names. Relations are checked through their join column, so only many-to-one relations work.

| Category | Checks | Example |
| --- | --- | --- |
| `REQUIRED_FIELDS` | `fields` are filled | Live company needs a complete profile |
| `ALLOWED_VALUES` | `constraint` (`in` / `notIn`) holds for a filled field | Live company can't have source Unknown |
| `STATUS_TRANSITION` | value only moves along `allowedTransitions` (from -> to[]); values not listed as a key move freely | Prospect can only go to Engaged |

Each rule can have `when` conditions (all must match, evaluated on the record after the write).

## Behavior

- A write is rejected only when it adds a violation. Records that already broke a rule stay editable, but can't get worse.
- Fields missing from a workspace are skipped, so one rule list works across workspaces.
- Writes made directly through the ORM (background jobs, sync commands) bypass the hooks.
