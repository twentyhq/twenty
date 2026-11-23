/* @license Enterprise */

import { buildOwnAccessGroupIdsExpression } from 'src/engine/permissions/internal/record-permission-repository/utils/build-own-access-group-ids-expression.util';
import { type RecordAccessGroupSQLCondition } from 'src/engine/permissions/internal/record-permission-repository/types/record-access-group-sql-condition.type';

export const buildRecordAccessGroupIdsExpression = ({
  recordAccessGroupSQLConditions,
  accessGroupValueLookupIdsExpressions,
  relatedRecordPathAccessGroupIdsExpressions,
}: {
  recordAccessGroupSQLConditions: RecordAccessGroupSQLCondition[];
  accessGroupValueLookupIdsExpressions: string[];
  relatedRecordPathAccessGroupIdsExpressions: string[];
}): string => {
  const ownAccessGroupIdsExpression = buildOwnAccessGroupIdsExpression(
    recordAccessGroupSQLConditions,
  );
  const additionalAccessGroupIdsExpressions = [
    ...accessGroupValueLookupIdsExpressions,
    ...relatedRecordPathAccessGroupIdsExpressions,
  ];

  if (additionalAccessGroupIdsExpressions.length === 0) {
    return ownAccessGroupIdsExpression;
  }

  return `ARRAY(SELECT DISTINCT "accessGroupId" FROM unnest(${[ownAccessGroupIdsExpression, ...additionalAccessGroupIdsExpressions].join(' || ')}) AS "accessGroupId" ORDER BY "accessGroupId")`;
};
