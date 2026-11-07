/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type RecordPermissionQuery } from 'src/engine/permissions/internal/record-permission-repository/types/record-permission-query.type';
import { type RecordShareCriteria } from 'src/engine/permissions/internal/record-permission-repository/types/record-share-criteria.type';
import {
  RecordShareException,
  RecordShareExceptionCode,
} from 'src/engine/permissions/record-share/record-share.exception';

export const buildDeleteRecordSharesQueryOrThrow = ({
  recordShareTableExpression,
  criteria: {
    ids,
    objectMetadataId,
    recordIds,
    principalId,
    principalType,
    rowCause,
    sourceId,
  },
}: {
  recordShareTableExpression: string;
  criteria: RecordShareCriteria;
}): RecordPermissionQuery => {
  const conditions = [
    isDefined(ids) && `"id" = ANY(:ids)`,
    isDefined(objectMetadataId) && `"objectMetadataId" = :objectMetadataId`,
    isDefined(recordIds) && `"recordId" = ANY(:recordIds)`,
    isDefined(principalId) && `"principalId" = :principalId`,
    isDefined(principalType) && `"principalType" = :principalType`,
    isDefined(rowCause) && `"rowCause" = :rowCause`,
    isDefined(sourceId) && `"sourceId" = :sourceId`,
  ].filter((condition) => condition !== false);

  if (conditions.length === 0) {
    throw new RecordShareException(
      'Deleting record shares requires at least one criterion',
      RecordShareExceptionCode.INVALID_SHARE_WITH,
    );
  }

  return {
    sql: `DELETE FROM ${recordShareTableExpression} WHERE ${conditions.join(' AND ')} AND "deletedAt" IS NULL`,
    parameters: {
      ...(isDefined(ids) && { ids }),
      ...(isDefined(objectMetadataId) && { objectMetadataId }),
      ...(isDefined(recordIds) && { recordIds }),
      ...(isDefined(principalId) && { principalId }),
      ...(isDefined(principalType) && { principalType }),
      ...(isDefined(rowCause) && { rowCause }),
      ...(isDefined(sourceId) && { sourceId }),
    },
  };
};
