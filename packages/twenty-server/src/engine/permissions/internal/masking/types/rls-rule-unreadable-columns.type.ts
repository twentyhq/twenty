import { type SqlCondition } from 'src/engine/permissions/types/sql-condition.type';

export type RlsRuleUnreadableColumns = {
  columnNames: string[];
  condition: SqlCondition;
};
