/* @license Enterprise */

import { combineSQLConditions } from 'src/engine/permissions/internal/record-permission-repository/utils/combine-sql-conditions.util';
import { type SQLCondition } from 'src/engine/permissions/types/sql-condition.type';

export const combineSQLConditionOutcomesWithOr = (
  sqlConditions: (SQLCondition | boolean)[],
): SQLCondition | boolean => {
  if (sqlConditions.some((sqlCondition) => sqlCondition === true)) {
    return true;
  }

  const definedSQLConditions = sqlConditions.filter(
    (sqlCondition): sqlCondition is SQLCondition => sqlCondition !== false,
  );

  if (definedSQLConditions.length <= 1) {
    return definedSQLConditions[0] ?? false;
  }

  return combineSQLConditions({
    sqlConditions: definedSQLConditions,
    operator: 'OR',
  });
};
