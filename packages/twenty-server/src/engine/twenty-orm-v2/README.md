# ORM v2

A workspace-data ORM that uses no TypeORM. It exposes the same surface as
`src/engine/twenty-orm` so call sites can move over one at a time, and underneath it
generates parameterised SQL from field metadata and hands it to `pg`.

Behind `IS_ORM_V2_READ_PATH_ENABLED`. Off, nothing changes.

## Why it can exist at all

Workspace entities have no classes. Every one is synthesised per request from
`core.objectMetadata` / `core.fieldMetadata`, which means TypeORM's entity-metadata graph
is built to describe tables the metadata already describes. Building it costs 3.2ms for a
726-column workspace with no relations and 12.6ms once relations are declared on both
sides, and it is rebuilt per cached workspace.

Two things that came out of tracing the read path, both of which cut against the obvious
framing:

- **The pg driver, not TypeORM, dominates row handling.** In the profile behind #23980,
  `parseRow` is 14.6% of slow-request event-loop time and TypeORM entity hydration is 3.0%.
  The 14.6% survives removing the ORM, so this is not where the win is.
- **Insert and upsert still lean on `EntityMetadata`.** They derive column defaults and
  the conflict target from it. Update, delete, soft-delete and restore turn out not to:
  their column list is the caller's data, their `RETURNING` mapping is the same projection
  the read path builds, and `updatedAt` is a single `CURRENT_TIMESTAMP` rule. Bypassing
  reads shrinks what the metadata cache is used for; it does not delete the cache.

So v2 has no ORM metadata. `WorkspaceTableShape` is the whole model: table name, schema,
columns, relations, and the composite-column mapping, derived from the flat maps. It is
plain data with no methods, no back-references and no cycles, so it costs a few objects
per object type rather than thousands, and it can be rebuilt or discarded freely.

## Layout

| path | what |
|---|---|
| `sql/` | named-parameter compiler: `:name` / `:...list` to `$1..$n` |
| `table-shape/` | `WorkspaceTableShape` and its builder from flat field metadata |
| `query-builder/` | `WorkspaceSelectQueryBuilderV2` and `WorkspaceMutationQueryBuilderV2`, the TypeORM-shaped builders |
| `repository/` | `WorkspaceRepositoryV2`, permissions and result formatting |
| `datasource/` | pool ownership and per-request data source |
| `executor/` | statement execution against a `pg` pool |

## Why not a query-builder library

Kysely, Drizzle standalone, pg-promise, postgres.js and @databases were all measured
against a hostile identifier and all escape correctly, so injection safety did not pick a
winner. Compilation cost did: for a 60-column findMany, TypeORM takes 231µs, Kysely 149µs
and a direct template string 3.7µs. A builder library replaces the part that field
metadata already drives while keeping most of the cost, so v2 generates the SQL itself and
uses `pg` as the driver.

## Why named parameters

The filter parser, the order parser and the row-level-permission renderer already emit SQL
strings with TypeORM-flavoured named parameters. Keeping that dialect means v2 reuses all
three unchanged: `compileNamedParameters` converts to positional binding at the last
moment. The compiler is a scanner, not a regex, so `::text` casts, `'string literals'` and
`"quoted identifiers"` containing colons are left alone.

## What is different from v1, deliberately

**Permissions do not parse SQL.** v1 recovers the entity, operation and column list from
`QueryExpressionMap`, including regex-matching `"alias"."column"` out of select strings,
because the permission check runs downstream of a builder it did not drive. v2 built the
query, so `getSelectedColumnNames()` returns the columns directly and
`validateOperationIsPermittedOrThrow` is called with them.

**Pagination is a plain parameterised LIMIT.** v1's `take` triggers TypeORM's two-phase
`distinctAlias` query as soon as any join is present, which strips ORDER BY and LIMIT from
the inner scan. Only a to-many join can duplicate root rows, and v2 refuses to render a
to-many join at all (relations are separate queries), so a plain LIMIT is correct. Page
size and offset bind as parameters rather than inlining, so paging through a table reuses
one statement shape instead of minting one per page.

**No named prepared statements.** Naming a statement lets Postgres parse and plan it once
per connection, but the plan is then retained for that connection's life, so naming has to
be capped or backend memory grows without bound. The resource is per-connection while any
in-process cap is per-process, and both pools are shared by every tenant, so a cap in the
executor cannot actually bound what it is trying to bound. Statements are therefore sent
unnamed. Values still bind separately, so nothing about injection safety depends on this.
Worth revisiting only with a measurement showing parse and plan are a real share of a
findMany round trip.

## What is the same, deliberately

- `getMany()` returns records with composite fields reassembled, via the same
  `formatResult` the v1 path uses. Same shape to callers.
- Soft delete: `deletedAt IS NULL` unless `withDeleted()`, and a nested bracket group does
  not carry its own copy of the predicate.
- `orderBy` ignores `castToText` / `useLower` on the builder path, matching v1. Only
  `getOrderByRawSQL` honours them, and that is a separate path.
- Row-level permission predicates come from the same resolver and renderer as v1.

## Covered so far

`createQueryBuilder`, `clone`, `where` / `andWhere` / `orWhere` (strings, bracket
factories, and object literals like `{ id: In([...]) }` — `in` only), `setParameters` /
`setParameter`, `setFindOptions({ select })`, `select` / `addSelect`, `orderBy` /
`addOrderBy`, `groupBy` / `addGroupBy`, `leftJoin` on to-one relations, `withDeleted`,
`limit` / `offset`, `take` / `skip` (aliases of `limit` / `offset` — safe because v2
never joins to-many), `getMany`, `getOne`, `getRawOne`, `getRawMany`, `getCount`,
`applyRowLevelPermissions`, `getQuery`, `getQueryAndParameters`. The repository also
exposes `executeRaw` for statements the table-shape builder cannot model (see below).

Wired into `CommonFindManyQueryRunnerService`, `CommonFindOneQueryRunnerService`,
`CommonFindDuplicatesQueryRunnerService` and `CommonGroupByQueryRunnerService`. Other
runners keep `repository`.

Nested relation loading also routes through v2 under the flag:
`ProcessNestedRelationsOrmV2Helper` loads relations and relation aggregates on v2
repositories, and composes the per-parent-limit `CROSS JOIN LATERAL` as raw SQL run
through `repository.executeRaw`. The shared `ProcessNestedRelationsHelper` flag-branches
to it, so a flagged read now reads root rows and their relations through v2.

group-by "with records" is the one path that is not a transparent swap: it wraps a
builder subquery in a table-less `FROM (subquery)` JSON_AGG query, which the
table-shape builder cannot represent. `GroupByWithRecordsV2Service` builds the inner
subquery with the v2 builder and runs the composed outer query through
`repository.executeRaw`; the runner flag-branches between it and the v1 service.

## Writes: the statement layer exists, nothing is wired

`WorkspaceMutationQueryBuilderV2` generates `UPDATE` / `DELETE` / soft-delete / restore
statements with `RETURNING`, reusing the same primitives as the select builder
(`quoteColumn`, the shared where renderer, the `mapRowToEntity` decode) plus a `SET`
generator. The select builder morphs into it: `.update()` / `.delete()` / `.softDelete()`
/ `.restore()` carry the current where clauses and parameters into the mutation, matching
the TypeORM surface the mutation runners already call.

Deliberate choices, all asserted by exact-SQL unit tests:

- Statements are alias-form (`UPDATE "schema"."table" AS "person" ... RETURNING
  "person"."id" AS "person_id"`), so the where renderer and the `RETURNING` projection are
  the select builder's, unchanged. `execute()` returns `{ generatedMaps, affected }` with
  `generatedMaps` run through the shared `formatResult`, matching what the v1 mutation
  builders hand back.
- A mutation never adds the `deletedAt IS NULL` predicate the read path uses: it operates
  on exactly the rows its filter matches, so restore reaches soft-deleted rows and delete
  reaches any row. This mirrors TypeORM, which injects the soft-delete predicate for
  SELECT only.
- `updatedAt` is stamped `CURRENT_TIMESTAMP` on every update unless the caller set it;
  soft-delete stamps `deletedAt` and `updatedAt`; restore clears `deletedAt` and stamps
  `updatedAt`.

Not wired to any runner yet: the mutation runners keep `repository` (v1) until the
per-endpoint migrations route them through this builder. Permission enforcement, row-level
predicates on writes and database event emission ride with that wiring, not this layer.

## Not covered yet

- Insert and upsert. `INSERT` / `ON CONFLICT` still go through v1, which is where the
  column defaults and conflict-target derivation live.
- Transactions and DDL.
- `find` / `findOne` / `findBy` and the rest of the repository surface used by
  `src/modules`.
- Transactions and DDL.
- Ordering group-by "with records" by a to-many relation: v2 refuses to-many joins, so
  it surfaces the standard "unsupported" user error rather than the row-multiplying join
  v1 would emit.
- The read runners hand the v2 builder to the shared parsers with a cast, because they
  are typed against the TypeORM class rather than an interface. Giving the parsers a
  structural `SelectQueryBuilderLike` type removes it and is the next cleanup.

## Verifying a change

```bash
npx jest src/engine/twenty-orm-v2 --config=jest.config.mjs
```

The builder tests assert exact SQL text. That is deliberate: this layer's contract is the
statement it emits, and a diff in generated SQL is the failure mode that matters.
