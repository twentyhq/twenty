import { type ObjectLiteral } from 'typeorm';

export type SqlCondition = { sql: string; parameters: ObjectLiteral };

export type RowAccessPolicy =
  | { kind: 'open' }
  | { kind: 'denied' }
  | { kind: 'gated'; condition: SqlCondition };

export const combineSqlConditions = (
  conditions: SqlCondition[],
): SqlCondition => ({
  sql: conditions.map((condition) => `(${condition.sql})`).join(' AND '),
  parameters: Object.assign(
    {},
    ...conditions.map((condition) => condition.parameters),
  ),
});
