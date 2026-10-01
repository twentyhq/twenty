import { type SqlCondition } from 'src/engine/twenty-orm/types/row-access-policy.type';

export const combineSqlConditionsWithOr = (
  conditions: SqlCondition[],
): SqlCondition => ({
  sql: `(${conditions.map((condition) => `(${condition.sql})`).join(' OR ')})`,
  parameters: Object.assign(
    {},
    ...conditions.map((condition) => condition.parameters),
  ),
});
