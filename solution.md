# Solution: Resolving `mergePeople` Duplicate Entry Failures

## 1. Resolution Overview

The issue where `mergePeople(..., dryRun: false)` fails with `"A duplicate entry was detected"` has two core dimensions:
1. **The Runtime Merge Failure:** Junction tables (e.g., `messageThreadTarget`, `calendarEventTarget`, `messageListMember`) were migrated without checking for links already held by the survivor record.
2. **The Dry-Run Inconsistency:** `dryRun: true` returns an in-memory field projection preview without validating transactional database constraints or relational integrity.

---

## 2. Immediate Fix: Upgrading Twenty

If running on version $\le$ 2.37.3, upgrade Twenty to version **$\ge$ 2.37.4** (or merge commit [`9ff5c467d4`](file:///packages/twenty-server/src/engine/api/common/common-query-runners/common-merge-many-query-runner.service.ts) / PR #25190).

### What Commit `9ff5c467d4` Fixed:
1. **Junction Deduplication via Soft-Delete:**
   Instead of blindly updating all related records pointing to `idsToDelete`, the merge runner now:
   - Discovers which unique indexes on related tables include the join column (via `computeDuplicateKeyColumnGroupsForJoinColumn`).
   - Fetches existing related records for both the absorbed records and the survivor.
   - Splits the records using `splitRelatedRecordIdsToMigrateAndSoftDelete`.
   - **Soft-deletes** the absorbed records that would cause duplicate key conflicts. Because junction unique indexes specify `indexWhereClause: '"deletedAt" IS NULL'`, soft-deleted rows no longer violate unique constraints.
   - Migrates only non-conflicting links to the survivor record.
2. **Chunked Migrations (`QUERY_MAX_RECORDS`):**
   Batches both soft-deletes and link migrations in chunks of 200 (`QUERY_MAX_RECORDS`) to prevent hitting the repository limit `TOO_MANY_RECORDS_TO_UPDATE`.
3. **Explicit Error Messages:**
   Updates `computeTwentyOrmException` to inspect `error.table` and `error.constraint`, returning:
   `"A duplicate entry was detected: unique constraint <tableName>.<constraintName> was violated"`.

---

## 3. Code Implementation Details

### A. Related Record Deduplication and Partitioning
Location: [`packages/twenty-server/src/engine/api/common/common-query-runners/utils/split-related-record-ids-to-migrate-and-soft-delete.util.ts`](file:///packages/twenty-server/src/engine/api/common/common-query-runners/utils/split-related-record-ids-to-migrate-and-soft-delete.util.ts)

```typescript
export const splitRelatedRecordIdsToMigrateAndSoftDelete = ({
  relatedRecordsOfRecordsToDelete,
  relatedRecordsOfPriorityRecord,
  duplicateKeyColumnGroups,
}: {
  relatedRecordsOfRecordsToDelete: ObjectRecord[];
  relatedRecordsOfPriorityRecord: ObjectRecord[];
  duplicateKeyColumnGroups: string[][];
}): { idsToMigrate: string[]; idsToSoftDelete: string[] } => {
  const takenDuplicateKeys = new Set(
    relatedRecordsOfPriorityRecord.flatMap((record) =>
      computeDuplicateKeys({ record, duplicateKeyColumnGroups }),
    ),
  );

  const idsToMigrate: string[] = [];
  const idsToSoftDelete: string[] = [];

  for (const record of relatedRecordsOfRecordsToDelete) {
    const duplicateKeys = computeDuplicateKeys({
      record,
      duplicateKeyColumnGroups,
    });

    // If the survivor already has a link for this unique composite key, soft-delete the duplicate link
    if (
      duplicateKeys.some((duplicateKey) => takenDuplicateKeys.has(duplicateKey))
    ) {
      idsToSoftDelete.push(record.id);
      continue;
    }

    duplicateKeys.forEach((duplicateKey) => takenDuplicateKeys.add(duplicateKey));
    idsToMigrate.push(record.id);
  }

  return { idsToMigrate, idsToSoftDelete };
};
```

### B. Safe Execution in `CommonMergeManyQueryRunnerService`
Location: [`packages/twenty-server/src/engine/api/common/common-query-runners/common-merge-many-query-runner.service.ts`](file:///packages/twenty-server/src/engine/api/common/common-query-runners/common-merge-many-query-runner.service.ts)

```typescript
// 1. Soft-delete duplicate links in batches
for (const idsChunk of chunk(idsToSoftDelete, QUERY_MAX_RECORDS)) {
  await relatedRepository.runMutation({
    selectQueryBuilder: relatedRepository
      .createQueryBuilder(alias)
      .where({ id: In(idsChunk) }),
    rowLevelPermissionsApplied: false,
    kind: 'soft-delete',
    columnsToReturn: ['id'],
  });
}

// 2. Migrate non-conflicting links in batches
for (const idsChunk of chunk(idsToMigrate, QUERY_MAX_RECORDS)) {
  await relatedRepository.runMutation({
    selectQueryBuilder: relatedRepository
      .createQueryBuilder(alias)
      .where({ id: In(idsChunk) }),
    rowLevelPermissionsApplied: false,
    kind: 'update',
    columnsToReturn: ['id'],
    data: { [joinColumnName]: priorityRecordId },
  });
}
```

### C. Constraint Reporting in `computeTwentyOrmException`
Location: [`packages/twenty-server/src/engine/twenty-orm/error-handling/compute-twenty-orm-exception.util.ts`](file:///packages/twenty-server/src/engine/twenty-orm/error-handling/compute-twenty-orm-exception.util.ts)

```typescript
const computeDuplicateEntryMessage = (error: Error): string => {
  const constraint =
    'constraint' in error && typeof error.constraint === 'string'
      ? error.constraint
      : undefined;

  if (!isDefined(constraint)) {
    return DUPLICATE_ENTRY_DETECTED_MESSAGE;
  }

  const table =
    'table' in error && typeof error.table === 'string'
      ? error.table
      : undefined;

  const qualifiedConstraintName = isDefined(table)
    ? `${table}.${constraint}`
    : constraint;

  return `${DUPLICATE_ENTRY_DETECTED_MESSAGE}: unique constraint ${qualifiedConstraintName} was violated`;
};
```

---

## 4. Closing the `dryRun` Validation Divergence

While the junction deduplication fix prevents the failure during real merges, `dryRun: true` inherently diverges from `dryRun: false` because it does not validate against the database. To align runtime merge execution with dryRun preview:

### Architectural Options:

#### Option A: Transactional Dry-Run (Rollback Pattern - Recommended for High Fidelity)
Execute the real transactional logic within a database transaction, but always issue a `ROLLBACK` instead of a `COMMIT`:
```typescript
if (args.dryRun) {
  return await this.workspaceOrmManager.runInWorkspaceTransaction(
    async (transactionScope) => {
      // 1. Execute all junction updates and soft-deletes
      // 2. Execute delete of absorbed records
      // 3. Execute update of survivor
      // 4. Extract simulated result
      // 5. Throw a RollbackException caught by workspaceOrmManager to rollback Postgres transaction
      throw new DryRunRollbackSignal(simulatedResult);
    },
  ).catch((error) => {
    if (error instanceof DryRunRollbackSignal) {
      return error.simulatedResult;
    }
    throw error; // Any unique violation or foreign key error bubbles up to dryRun caller
  });
}
```
- **Pros:** 100% parity between dry run and execution path. Catches triggers, row-level security violations, foreign key conflicts, and index violations.
- **Cons:** Slightly higher database overhead for dry runs.

#### Option B: Pre-flight Simulation in `dryRun`
If a full rollback transaction is too heavy:
- Execute `computeDuplicateKeyColumnGroupsForJoinColumn` and check for unresolvable constraints during `dryRun`.
- Ensure custom unique indexes on custom entities pointing to `Person` are scanned.
- If an unresolvable collision is detected, throw the appropriate `BAD_USER_INPUT` error in `dryRun`.

#### Option C: Schema & Documentation Alignment
Clarify in the GraphQL schema description that `dryRun: true` returns a **merged field preview** (how fields such as emails, names, and phones combine into the surviving record) rather than a complete transactional simulation.

---

## 5. Verification & Test Suite

The solution is covered by comprehensive integration tests in:
[`packages/twenty-server/test/integration/graphql/suites/object-generated/people-merge-many.integration-spec.ts`](file:///packages/twenty-server/test/integration/graphql/suites/object-generated/people-merge-many.integration-spec.ts)

### Key Test Scenarios:
1. **Shared Message Thread:**
   - Two `Person` records attached to the same `messageThreadTarget`.
   - Merging them succeeds: duplicate target is soft-deleted, unique target is migrated.
2. **Exceeding Mutation Batch Limits:**
   - Person carrying $> 200$ related records merges cleanly across batches.
3. **Composite Email Deduplication:**
   - Merges primary and additional emails without duplicating shared email addresses.
4. **Dry Run:**
   - Verifies field combinations preview without altering source records.

### Running the Tests:
```bash
npx jest packages/twenty-server/test/integration/graphql/suites/object-generated/people-merge-many.integration-spec.ts --config=packages/twenty-server/jest.config.mjs
```

