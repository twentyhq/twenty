/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type RecordAccessGroupSQLCondition } from 'src/engine/permissions/internal/record-permission-repository/types/record-access-group-sql-condition.type';

const buildOwnAccessGroupIdsExpression = (
  recordAccessGroupSQLConditions: RecordAccessGroupSQLCondition[],
): string => {
  if (recordAccessGroupSQLConditions.length === 0) {
    return `CAST('{}' AS integer[])`;
  }

  const compactIdCases = recordAccessGroupSQLConditions.map(
    ({ compactId, sqlCondition }) =>
      isDefined(sqlCondition)
        ? `CASE WHEN (${sqlCondition.sql}) THEN ${compactId} END`
        : `${compactId}`,
  );

  return `ARRAY_REMOVE(CAST(ARRAY[${compactIdCases.join(', ')}] AS integer[]), NULL)`;
};

export const buildRecordAccessGroupIdsExpression = ({
  recordAccessGroupSQLConditions,
  accessGroupFamilyIdsExpressions,
  inheritedAccessGroupIdsExpressions,
}: {
  recordAccessGroupSQLConditions: RecordAccessGroupSQLCondition[];
  accessGroupFamilyIdsExpressions: string[];
  inheritedAccessGroupIdsExpressions: string[];
}): string => {
  const ownAccessGroupIdsExpression = buildOwnAccessGroupIdsExpression(
    recordAccessGroupSQLConditions,
  );
  const additionalAccessGroupIdsExpressions = [
    ...accessGroupFamilyIdsExpressions,
    ...inheritedAccessGroupIdsExpressions,
  ];

  if (additionalAccessGroupIdsExpressions.length === 0) {
    return ownAccessGroupIdsExpression;
  }

  return `ARRAY(SELECT DISTINCT "accessGroupId" FROM unnest(${[ownAccessGroupIdsExpression, ...additionalAccessGroupIdsExpressions].join(' || ')}) AS "accessGroupId" ORDER BY "accessGroupId")`;
};
