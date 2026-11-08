import { type SqlCondition } from 'src/engine/permissions/types/sql-condition.type';

export type UnreadableFieldsWithCondition = {
  fieldMetadataIds: string[];
  condition: SqlCondition;
};
