/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type RecordAccessGroupSQLCondition } from 'src/engine/permissions/internal/record-permission-repository/types/record-access-group-sql-condition.type';

export const buildRecordAccessGroupIdsExpression = ({
  recordAccessGroupSQLConditions,
}: {
  recordAccessGroupSQLConditions: RecordAccessGroupSQLCondition[];
}): string => {
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
