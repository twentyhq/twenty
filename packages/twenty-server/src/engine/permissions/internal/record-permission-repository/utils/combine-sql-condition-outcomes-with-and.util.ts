/* @license Enterprise */

import { combineSQLConditions } from 'src/engine/permissions/internal/record-permission-repository/utils/combine-sql-conditions.util';
import { type SQLCondition } from 'src/engine/permissions/types/sql-condition.type';

export const combineSQLConditionOutcomesWithAnd = (
  sqlConditions: (SQLCondition | boolean)[],
): SQLCondition | boolean => {
  if (sqlConditions.some((sqlCondition) => sqlCondition === false)) {
    return false;
  }

  const definedSQLConditions = sqlConditions.filter(
    (sqlCondition): sqlCondition is SQLCondition => sqlCondition !== true,
  );

  if (definedSQLConditions.length <= 1) {
    return definedSQLConditions[0] ?? true;
  }

  return combineSQLConditions({ sqlConditions: definedSQLConditions });
};
