import { type SqlCondition } from 'src/engine/twenty-orm/types/row-access-policy.type';

export const combineSqlConditions = (
  conditions: SqlCondition[],
): SqlCondition => ({
  sql: conditions.map((condition) => `(${condition.sql})`).join(' AND '),
  parameters: Object.assign(
    {},
    ...conditions.map((condition) => condition.parameters),
  ),
});
