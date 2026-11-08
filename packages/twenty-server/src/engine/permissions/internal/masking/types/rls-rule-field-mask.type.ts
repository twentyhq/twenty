import { type SqlCondition } from 'src/engine/permissions/types/sql-condition.type';

export type RlsRuleFieldMask = {
  columnNames: string[];
  condition: SqlCondition;
};
