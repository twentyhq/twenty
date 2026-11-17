import { type FieldMetadataType } from 'twenty-shared/types';

export type ComputedFieldDateSqlOperand = {
  sql: string;
  type: FieldMetadataType.DATE | FieldMetadataType.DATE_TIME;
};
