import { type SqlCondition } from 'src/engine/permissions/types/sql-condition.type';

export type RuleFieldMask = {
  columnNames: string[];
  condition: SqlCondition;
};
