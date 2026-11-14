/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type RecordAccessGroupSQLCondition } from 'src/engine/permissions/internal/record-permission-repository/types/record-access-group-sql-condition.type';

const buildOwnAccessGroupIdsExpression = (
  recordAccessGroupSQLConditions: RecordAccessGroupSQLCondition[],
): string => {
  const compactIdCases: string[] = [];
  const compactIdsSQLExpressions: string[] = [];

  for (const recordAccessGroupSQLCondition of recordAccessGroupSQLConditions) {
    if ('compactIdsSQLExpression' in recordAccessGroupSQLCondition) {
      compactIdsSQLExpressions.push(
        recordAccessGroupSQLCondition.compactIdsSQLExpression.sql,
      );
      continue;
    }

    const { compactId, sqlCondition } = recordAccessGroupSQLCondition;

    compactIdCases.push(
      isDefined(sqlCondition)
        ? `CASE WHEN (${sqlCondition.sql}) THEN ${compactId} END`
        : `${compactId}`,
    );
  }

  return [
    ...(compactIdCases.length > 0
      ? [
          `ARRAY_REMOVE(CAST(ARRAY[${compactIdCases.join(', ')}] AS integer[]), NULL)`,
        ]
      : []),
    ...compactIdsSQLExpressions,
    ...(recordAccessGroupSQLConditions.length === 0
      ? [`CAST('{}' AS integer[])`]
      : []),
  ].join(' || ');
};

export const buildRecordAccessGroupIdsExpression = ({
  recordAccessGroupSQLConditions,
  inheritedAccessGroupIdsExpressions,
}: {
  recordAccessGroupSQLConditions: RecordAccessGroupSQLCondition[];
  inheritedAccessGroupIdsExpressions: string[];
}): string => {
  const ownAccessGroupIdsExpression = buildOwnAccessGroupIdsExpression(
    recordAccessGroupSQLConditions,
  );

  if (inheritedAccessGroupIdsExpressions.length === 0) {
    return ownAccessGroupIdsExpression;
  }

  return `ARRAY(SELECT DISTINCT "accessGroupId" FROM unnest(${[ownAccessGroupIdsExpression, ...inheritedAccessGroupIdsExpressions].join(' || ')}) AS "accessGroupId" ORDER BY "accessGroupId")`;
};
