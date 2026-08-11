# ORM v2

A workspace-data ORM that uses no TypeORM. It exposes the same surface as
`src/engine/twenty-orm` so call sites can move over one at a time, and underneath it
generates parameterised SQL from field metadata and hands it to `pg` as a prepared
statement.

Behind `IS_ORM_V2_READ_PATH_ENABLED`. Off, nothing changes.

## Why it can exist at all

Workspace entities have no classes. Every one is synthesised per request from
`core.objectMetadata` / `core.fieldMetadata`, which means TypeORM's entity-metadata graph
is built to describe tables the metadata already describes. See
`docs/investigations/orm-read-path/` for the measurements behind that.

So v2 has no ORM metadata. `WorkspaceTableShape` is the whole model: table name, schema,
columns, relations, and the composite-column mapping, derived from the flat maps. It is
plain data with no methods, no back-references and no cycles, so it costs a few objects
per object type rather than thousands, and it can be rebuilt or discarded freely.

## Layout

| path | what |
|---|---|
| `sql/` | named-parameter compiler: `:name` / `:...list` to `$1..$n` |
| `table-shape/` | `WorkspaceTableShape` and its builder from flat field metadata |
| `query-builder/` | `WorkspaceSelectQueryBuilderV2`, the TypeORM-shaped builder |
| `repository/` | `WorkspaceRepositoryV2`, permissions and result formatting |
| `datasource/` | pool ownership and per-request data source |
| `executor/` | prepared-statement execution against `pg` |

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

**`take()` is a plain LIMIT.** v1's `take` triggers TypeORM's two-phase `distinctAlias`
query as soon as any join is present, which strips ORDER BY and LIMIT from the inner scan.
Only a to-many join can duplicate root rows, and v2 refuses to join to-many at all
(relations are separate queries), so a plain LIMIT is correct.

**Prepared statements.** Query text is generated from metadata and repeats across
requests, so statements carry a name and Postgres parses and plans each once per
connection. Names are bounded at 1000 distinct SQL shapes, because a connection retains
every prepared statement for its lifetime; past that cap statements are sent unnamed and
simply lose the plan reuse.

## What is the same, deliberately

- `getMany()` returns records with composite fields reassembled, via the same
  `formatResult` the v1 path uses. Same shape to callers.
- Soft delete: `deletedAt IS NULL` unless `withDeleted()`, and a nested bracket group does
  not carry its own copy of the predicate.
- `orderBy` ignores `castToText` / `useLower` on the builder path, matching v1. Only
  `getOrderByRawSQL` honours them, and that is a separate path.
- Row-level permission predicates come from the same resolver and renderer as v1.

## Covered so far

`createQueryBuilder`, `clone`, `where` / `andWhere` / `orWhere` (strings and bracket
factories), `setParameters`, `setFindOptions({ select })`, `addSelect`, `orderBy` /
`addOrderBy`, `groupBy` / `addGroupBy`, `leftJoin` on to-one relations, `withDeleted`,
`take` / `skip` / `limit` / `offset`, `getMany`, `getOne`, `getRawMany`, `getRawOne`,
`getCount`, `getQuery`, `getQueryAndParameters`.

Wired into `CommonFindManyQueryRunnerService` only. Other runners keep `repository`.

## Not covered yet

- Writes. Insert, update, delete, soft delete and upsert still go through v1, which is
  where `EntityMetadata` is genuinely used (column list, `RETURNING` mapping, `updatedAt`
  maintenance). Removing it from reads shrinks what the metadata cache is used for; it
  does not delete the cache.
- Relation loading. `ProcessNestedRelationsV2Helper` still runs on v1 repositories, so a
  flagged findMany selecting relations reads its root rows through v2 and its relations
  through v1.
- `find` / `findOne` / `findBy` and the rest of the repository surface used by
  `src/modules`.
- Transactions, DDL, aggregate group-by.
- One cast remains where `CommonFindManyQueryRunnerService` hands the v2 builder to the
  shared parsers, because they are typed against the TypeORM class rather than an
  interface. Giving the parsers a structural `SelectQueryBuilderLike` type removes it and
  is the next cleanup.

## Verifying a change

```bash
npx jest src/engine/twenty-orm-v2 --config=jest.config.mjs
```

The builder tests assert exact SQL text. That is deliberate: this layer's contract is the
statement it emits, and a diff in generated SQL is the failure mode that matters.
