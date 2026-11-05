/* @license Enterprise */

import { executeRecordPermissionQuery } from 'src/engine/permissions/record-permission-orm/utils/execute-record-permission-query.util';
import { type RecordShareGrant } from 'src/engine/permissions/record-share/types/record-share-grant.type';
import { type QueryExecutor } from 'src/engine/twenty-orm/executor/types/query-executor.type';

export const findRecordShareGrants = async ({
  executor,
  recordShareTableExpression,
  objectMetadataId,
  recordIds,
}: {
  executor: QueryExecutor;
  recordShareTableExpression: string;
  objectMetadataId: string;
  recordIds: string[];
}): Promise<RecordShareGrant[]> => {
  if (recordIds.length === 0) {
    return [];
  }

  return executeRecordPermissionQuery<RecordShareGrant>({
    executor,
    sql: `SELECT "recordId", "principalId", "accessLevel" FROM ${recordShareTableExpression} WHERE "objectMetadataId" = :objectMetadataId AND "recordId" = ANY(:recordIds) AND "deletedAt" IS NULL`,
    parameters: { objectMetadataId, recordIds },
  });
};
