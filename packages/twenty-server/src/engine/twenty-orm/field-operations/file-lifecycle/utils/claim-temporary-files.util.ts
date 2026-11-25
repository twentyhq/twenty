import { type RawQueryExecutor } from 'src/engine/twenty-orm/field-operations/file-lifecycle/types/raw-query-executor.type';

export const claimTemporaryFiles = async ({
  executeRawQuery,
  workspaceId,
  claims,
  isClaimableByRecordRequired,
}: {
  executeRawQuery: RawQueryExecutor;
  workspaceId: string;
  claims: { fileId: string; pathPrefix: string }[];
  isClaimableByRecordRequired: boolean;
}): Promise<string[]> => {
  if (claims.length === 0) {
    return [];
  }

  const claimedFiles = await executeRawQuery(
    `UPDATE "core"."file" AS "file"
     SET "settings" = '{"isTemporaryFile":false,"toDelete":false}'::jsonb,
         "updatedAt" = now()
     FROM unnest($1::uuid[], $2::text[]) AS "claim"("fileId", "pathPrefix")
     WHERE "file"."id" = "claim"."fileId"
       AND "file"."workspaceId" = $3
       AND "file"."status" <> 'PENDING'
       AND "file"."settings"->>'isTemporaryFile' = 'true'
       AND ($4::boolean IS FALSE OR "file"."settings"->>'isClaimableByRecord' = 'true')
       AND starts_with("file"."path", "claim"."pathPrefix")
     RETURNING "file"."id"`,
    [
      claims.map(({ fileId }) => fileId),
      claims.map(({ pathPrefix }) => pathPrefix),
      workspaceId,
      isClaimableByRecordRequired,
    ],
  );

  return [...new Set(claimedFiles.map(({ id }) => String(id)))];
};
