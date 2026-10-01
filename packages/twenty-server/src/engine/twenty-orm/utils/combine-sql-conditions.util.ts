import { type SqlCondition } from 'src/engine/twenty-orm/types/row-access-policy.type';

export const combineSqlConditions = (
  conditions: SqlCondition[],
  operator: 'AND' | 'OR' = 'AND',
): SqlCondition => {
  const sql = conditions
    .map((condition) => `(${condition.sql})`)
    .join(` ${operator} `);

  return {
    sql: operator === 'OR' ? `(${sql})` : sql,
    parameters: Object.assign(
      {},
      ...conditions.map((condition) => condition.parameters),
    ),
  };
};
