/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type RecordAccessGroupCondition } from 'src/engine/permissions/internal/record-permission-repository/types/record-access-group-condition.type';

export const buildRecordAccessGroupIdsExpression = ({
  recordAccessGroupConditions,
}: {
  recordAccessGroupConditions: RecordAccessGroupCondition[];
}): string => {
  if (recordAccessGroupConditions.length === 0) {
    return `CAST('{}' AS integer[])`;
  }

  const compactIdCases = recordAccessGroupConditions.map(
    ({ compactId, condition }) =>
      isDefined(condition)
        ? `CASE WHEN (${condition.sql}) THEN ${compactId} END`
        : `${compactId}`,
  );

  return `ARRAY_REMOVE(CAST(ARRAY[${compactIdCases.join(', ')}] AS integer[]), NULL)`;
};
