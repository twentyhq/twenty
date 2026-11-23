import { type RawQueryExecutor } from 'src/engine/twenty-orm/field-operations/file-lifecycle/types/raw-query-executor.type';

export const softDeleteFiles = async ({
  executeRawQuery,
  workspaceId,
  fileIds,
}: {
  executeRawQuery: RawQueryExecutor;
  workspaceId: string;
  fileIds: string[];
}): Promise<void> => {
  if (fileIds.length === 0) {
    return;
  }

  await executeRawQuery(
    `UPDATE "core"."file"
     SET "deletedAt" = now()
     WHERE "id" = ANY($1::uuid[])
       AND "workspaceId" = $2
       AND "deletedAt" IS NULL`,
    [fileIds, workspaceId],
  );
};
