import { type SqlCondition } from 'src/engine/permissions/types/sql-condition.type';

export type UnreadableFieldsWithRlsRuleSqlCondition = {
  fieldMetadataIds: string[];
  rlsRuleSqlCondition: SqlCondition;
};
