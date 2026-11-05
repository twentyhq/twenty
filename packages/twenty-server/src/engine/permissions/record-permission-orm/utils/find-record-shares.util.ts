/* @license Enterprise */

import { executeRecordPermissionQuery } from 'src/engine/permissions/record-permission-orm/utils/execute-record-permission-query.util';
import { type RecordShare } from 'src/engine/permissions/record-share/types/record-share.type';
import { type QueryExecutor } from 'src/engine/twenty-orm/executor/types/query-executor.type';

export const findRecordShares = async ({
  executor,
  recordShareTableExpression,
  objectMetadataId,
  recordIds,
}: {
  executor: QueryExecutor;
  recordShareTableExpression: string;
  objectMetadataId: string;
  recordIds: string[];
}): Promise<RecordShare[]> => {
  if (recordIds.length === 0) {
    return [];
  }

  return executeRecordPermissionQuery<RecordShare>({
    executor,
    sql: `SELECT "id", "recordId", "objectMetadataId", "principalId", "principalType", "accessLevel", "rowCause", "sourceId" FROM ${recordShareTableExpression} WHERE "objectMetadataId" = :objectMetadataId AND "recordId" = ANY(:recordIds) AND "deletedAt" IS NULL`,
    parameters: { objectMetadataId, recordIds },
  });
};
