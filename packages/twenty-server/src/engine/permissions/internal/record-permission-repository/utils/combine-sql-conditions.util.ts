import { type SQLCondition } from 'src/engine/permissions/types/sql-condition.type';

export const combineSQLConditions = ({
  sqlConditions,
  operator = 'AND',
}: {
  sqlConditions: SQLCondition[];
  operator?: 'AND' | 'OR';
}): SQLCondition => {
  const sql = sqlConditions
    .map((sqlCondition) => `(${sqlCondition.sql})`)
    .join(` ${operator} `);

  return {
    sql: operator === 'OR' ? `(${sql})` : sql,
    parameters: Object.assign(
      {},
      ...sqlConditions.map((sqlCondition) => sqlCondition.parameters),
    ),
  };
};
