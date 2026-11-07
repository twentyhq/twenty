/* @license Enterprise */

import { type RecordPermissionQuery } from 'src/engine/permissions/internal/record-permission-repository/types/record-permission-query.type';

export const buildFindRecordSharesQuery = ({
  recordShareTableExpression,
  objectMetadataId,
  recordIds,
}: {
  recordShareTableExpression: string;
  objectMetadataId: string;
  recordIds: string[];
}): RecordPermissionQuery => ({
  sql: `SELECT "id", "recordId", "objectMetadataId", "principalId", "principalType", "accessLevel", "rowCause", "sourceId" FROM ${recordShareTableExpression} WHERE "objectMetadataId" = :objectMetadataId AND "recordId" = ANY(:recordIds) AND "deletedAt" IS NULL`,
  parameters: { objectMetadataId, recordIds },
});
