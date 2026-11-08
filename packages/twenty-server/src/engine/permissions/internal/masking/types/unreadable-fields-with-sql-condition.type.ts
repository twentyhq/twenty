import { type SqlCondition } from 'src/engine/permissions/types/sql-condition.type';

export type UnreadableFieldsWithSqlCondition = {
  fieldMetadataIds: string[];
  sqlCondition: SqlCondition;
};
