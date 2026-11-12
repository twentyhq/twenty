/* @license Enterprise */

import { RecordShareRowCause } from 'twenty-shared/types';

import { type RecordPermissionQuery } from 'src/engine/permissions/internal/record-permission-repository/types/record-permission-query.type';

export type RuleRecordSharesScope =
  | { recordIds: string[] }
  | { sourceId: string };

export const buildFindRuleRecordSharesQuery = ({
  recordShareTableExpression,
  objectMetadataId,
  scope,
}: {
  recordShareTableExpression: string;
  objectMetadataId: string;
  scope: RuleRecordSharesScope;
}): RecordPermissionQuery => ({
  sql: `SELECT "id", "recordId", "objectMetadataId", "principalId", "principalType", "accessLevel", "rowCause", "sourceId" FROM ${recordShareTableExpression} WHERE "objectMetadataId" = :objectMetadataId AND "rowCause" = :rowCause AND ${'recordIds' in scope ? '"recordId" = ANY(:recordIds)' : '"sourceId" = :sourceId'} AND "deletedAt" IS NULL`,
  parameters: {
    objectMetadataId,
    rowCause: RecordShareRowCause.RULE,
    ...scope,
  },
});
