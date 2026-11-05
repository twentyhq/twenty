/* @license Enterprise */

import { type RecordShareGrant } from 'src/engine/permissions/record-share/types/record-share-grant.type';
import { type QueryExecutor } from 'src/engine/twenty-orm/executor/types/query-executor.type';
import { compileNamedParameters } from 'src/engine/twenty-orm/sql/utils/compile-named-parameters.util';

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

  const rows = await executor.execute(
    compileNamedParameters(
      `SELECT "recordId", "principalId", "accessLevel" FROM ${recordShareTableExpression} WHERE "objectMetadataId" = :objectMetadataId AND "recordId" = ANY(:recordIds) AND "deletedAt" IS NULL`,
      { objectMetadataId, recordIds },
    ),
  );

  return rows as RecordShareGrant[];
};
