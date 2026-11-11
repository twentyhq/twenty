# Root Cause Analysis: `mergePeople` Mutation Duplicate Entry Failure

## 1. Executive Summary

When executing the GraphQL mutation `mergePeople` with `dryRun: true`, the operation succeeds cleanly and returns a projected merge payload. However, executing the exact same mutation with `dryRun: false` on the identical records consistently fails with:

```json
{
  "errors": [
    {
      "message": "A duplicate entry was detected",
      "extensions": {
        "userFriendlyMessage": "This record already exists. Please check your data and try again.",
        "code": "BAD_USER_INPUT"
      }
    }
  ]
}
```

This issue was reproduced on 11 distinct Person groups across 2–4 members each, regardless of `conflictPriorityIndex` (0 vs 1), and occurred even when no third colliding record existed on the `person` table.

### Primary Root Causes
1. **Underlying Postgres Unique Violation on Junction Tables (not `person`):**
   The duplicate error was **not** triggered by duplicate fields on the `Person` records (such as `name` or `emails`). Instead, it was triggered on child/junction tables pointing to `Person`—specifically **`messageThreadTarget`** and **`calendarEventTarget`** (and in some cases **`messageListMember`**). When multiple `Person` records are flagged as duplicates by email/contact scans, they almost always participate in the **same message threads** or **same calendar events**. During `dryRun: false`, the merge runner attempted to migrate all child records to the survivor (`priorityRecordId`) via a blind `UPDATE`, creating duplicate entries in the junction table and violating composite unique indexes such as `(messageThreadId, targetPersonId)`.
2. **Complete Divergence between `dryRun: true` and `dryRun: false` Paths:**
   `dryRun: true` does **not** simulate or validate database writes. It merely performs an in-memory field merge of the source records and returns a mock object (`createDryRunResponse`) with a freshly generated UUID and timestamp. It never executes the database transaction, never executes the relation migrations, and never touches any database constraints.
3. **Generic Error Masking in Versions <= 2.37.3:**
   In server versions up to 2.37.3 (prior to PR #25190 / commit `9ff5c467d4`), `computeTwentyOrmException` swallowed the Postgres constraint name and table name on `23505` (`unique_violation`) errors, hardcoding the message to `"A duplicate entry was detected"`. This misled users into looking for duplicate names or emails on the `Person` table.

---

## 2. Architecture & Code Locations

| Component | File Path |
| :--- | :--- |
| **GraphQL Resolver Factory** | [`merge-many-resolver.factory.ts`](file:///packages/twenty-server/src/engine/api/graphql/workspace-resolver-builder/factories/merge-many-resolver.factory.ts) |
| **Merge Execution Runner** | [`common-merge-many-query-runner.service.ts`](file:///packages/twenty-server/src/engine/api/common/common-query-runners/common-merge-many-query-runner.service.ts) |
| **Exception Formatter** | [`compute-twenty-orm-exception.util.ts`](file:///packages/twenty-server/src/engine/twenty-orm/error-handling/compute-twenty-orm-exception.util.ts) |
| **GraphQL Error Transformer** | [`twenty-orm-graphql-api-exception-handler.util.ts`](file:///packages/twenty-server/src/engine/twenty-orm/utils/twenty-orm-graphql-api-exception-handler.util.ts) |
| **Composite Unique Field Utils** | [`compute-duplicate-key-column-groups-for-join-column.util.ts`](file:///packages/twenty-server/src/engine/api/common/common-query-runners/utils/compute-duplicate-key-column-groups-for-join-column.util.ts) |
| **Integration Test Suite** | [`people-merge-many.integration-spec.ts`](file:///packages/twenty-server/test/integration/graphql/suites/object-generated/people-merge-many.integration-spec.ts) |

### Generated GraphQL Mutation Schema
```graphql
mergePeople(
  ids: [UUID!]!
  conflictPriorityIndex: Int!
  dryRun: Boolean
): Person!
```

---

## 3. Deep Dive: Why `dryRun: true` and `dryRun: false` Diverge

In [`CommonMergeManyQueryRunnerService.run()`](file:///packages/twenty-server/src/engine/api/common/common-query-runners/common-merge-many-query-runner.service.ts):

```typescript
// 1. Fetch source records by IDs
const recordsToMerge = await this.fetchRecordsToMerge(queryRunnerContext, args);

// 2. Validate conflictPriorityIndex and extract survivor
const priorityRecord = this.validateAndGetPriorityRecord(
  recordsToMerge,
  args.ids,
  args.conflictPriorityIndex,
);

// 3. In-memory deep merge of scalar, composite (emails, phones), and relation fields
const mergedData = this.performDeepMerge(
  recordsToMerge,
  priorityRecord.id,
  flatObjectMetadata,
  flatFieldMetadataMaps,
  args.dryRun ?? false,
);

// --- DIVERGENCE POINT ---
if (args.dryRun) {
  return this.createDryRunResponse(priorityRecord, mergedData);
}

// 4. Real transaction path
const idsToDelete = args.ids.filter((id) => id !== priorityRecord.id);

const updatedRecord = await this.executeMergeWithinTransaction({
  args,
  queryRunnerContext,
  idsToDelete,
  priorityRecordId: priorityRecord.id,
  mergedData,
});
```

### The `dryRun: true` Path
When `dryRun: true` is passed:
```typescript
private createDryRunResponse(
  priorityRecord: ObjectRecord,
  mergedData: Partial<ObjectRecord>,
): ObjectRecord {
  const dryRunRecord: ObjectRecord = {
    ...priorityRecord,
    ...mergedData,
    id: uuidv4(),
    deletedAt: new Date().toISOString(),
  };

  return dryRunRecord;
}
```
- **No transaction is started.**
- **No database mutations are attempted** (no `INSERT`, `UPDATE`, or `DELETE`).
- **No related records are migrated.**
- **No database constraints are checked** (unique indexes, foreign keys, non-null constraints, RLS policies).
Consequently, `dryRun: true` succeeds as long as the source record IDs exist and `conflictPriorityIndex` is within array bounds.

---

## 4. The Database Failure Mechanism (`dryRun: false`)

When `dryRun: false` is executed, [`executeMergeWithinTransaction()`](file:///packages/twenty-server/src/engine/api/common/common-query-runners/common-merge-many-query-runner.service.ts) runs:

```typescript
return this.workspaceOrmManager.runInWorkspaceTransaction(
  async (transactionScope) => {
    // Step 1: Migrate all related records pointing to person
    for (const relationField of this.getRelationFieldsPointingToCurrentObject(
      queryRunnerContext,
    )) {
      await this.mergeRelatedRecordsIntoPriorityRecord({
        transactionScope,
        relationField,
        ...
      });
    }

    // Step 2: Delete absorbed records
    await objectRepository.runMutation({
      selectQueryBuilder: objectRepository.createQueryBuilder(alias).where({ id: In(idsToDelete) }),
      kind: 'delete',
      columnsToReturn,
    });

    // Step 3: Update survivor with merged attributes
    const updatedRecords = await objectRepository.runMutation({
      selectQueryBuilder: objectRepository.createQueryBuilder(alias).where({ id: priorityRecordId }),
      kind: 'update',
      columnsToReturn,
      data: resolvedMergedData,
    });

    return updatedRecords[0];
  },
);
```

### What Happened in Step 1 (Pre-Fix in <= 2.37.3):
Before PR #25190, the code for migrating related records was:
```typescript
for (const relationField of this.getRelationFieldsPointingToCurrentObject(queryRunnerContext)) {
  const relatedRepository = transactionScope.getRepository(
    relationField.objectMetadata.nameSingular,
    rolePermissionConfig,
  );

  await relatedRepository.runMutation({
    selectQueryBuilder: relatedRepository
      .createQueryBuilder(relationField.objectMetadata.nameSingular)
      .where({ [relationField.joinColumnName]: In(idsToDelete) }),
    rowLevelPermissionsApplied: false,
    kind: 'update',
    columnsToReturn: ['id'],
    data: { [relationField.joinColumnName]: priorityRecordId },
  });
}
```

### The Collision
1. PR #24776 introduced unique constraints on junction objects:
   - `messageThreadTarget`: unique index on `(messageThreadId, targetPersonId)` where `"deletedAt" IS NULL`.
   - `calendarEventTarget`: unique index on `(calendarEventId, targetPersonId)` where `"deletedAt" IS NULL`.
   - `messageListMember`: unique index on `(listId, personId)` where `"deletedAt" IS NULL`.
2. Real-world duplicate `Person` records (flagged by deduplication scans) frequently share the exact same message thread (e.g. email sync linked the incoming thread to both contact records).
3. Suppose Thread `T1` was linked to both:
   - `messageThreadTarget` row 1: `{ messageThreadId: T1, targetPersonId: Person_A }`
   - `messageThreadTarget` row 2: `{ messageThreadId: T1, targetPersonId: Person_B }`
4. The migration runner attempted:
   ```sql
   UPDATE "workspace_xxx"."messageThreadTarget"
   SET "targetPersonId" = 'Person_A'
   WHERE "targetPersonId" = 'Person_B';
   ```
5. Postgres threw error **`23505 (unique_violation)`**:
   `duplicate key value violates unique constraint "IDX_messageThreadTarget_..." (messageThreadId, targetPersonId)`

---

## 5. Why Diagnostic Attempts Failed

1. **Why swapping `conflictPriorityIndex` (0 vs 1) failed:**
   If `Person_A` and `Person_B` share Thread `T1`:
   - With index 0 (`Person_A` is priority): Row 2 (`Person_B`) is updated to `Person_A` $\rightarrow$ collides with Row 1.
   - With index 1 (`Person_B` is priority): Row 1 (`Person_A`) is updated to `Person_B` $\rightarrow$ collides with Row 2.
   Both directions result in the identical unique index collision.
2. **Why checking for a third colliding record on `person` yielded nothing:**
   The uniqueness violation was not on `person.emailsPrimaryEmail` or `person.name`. It occurred on the child junction table `messageThreadTarget` (or `calendarEventTarget`).
3. **Why the error message lacked details:**
   In `compute-twenty-orm-exception.util.ts` before PR #25190:
   ```typescript
   if (errorCode === POSTGRESQL_ERROR_CODES.UNIQUE_VIOLATION) {
     return withCause(
       new TwentyOrmException(
         DUPLICATE_ENTRY_DETECTED_MESSAGE, // Static string: "A duplicate entry was detected"
         TwentyOrmExceptionCode.DUPLICATE_ENTRY_DETECTED,
         { userFriendlyMessage: DUPLICATE_ENTRY_USER_FRIENDLY_MESSAGE },
       ),
       error,
     );
   }
   ```
   The constraint name (`error.constraint`) and table name (`error.table`) were discarded, producing the unhelpful error response.

