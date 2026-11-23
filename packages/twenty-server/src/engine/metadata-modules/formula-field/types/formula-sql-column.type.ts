import { type FieldMetadataType } from 'twenty-shared/types';

// A stored column a formula can read, keyed elsewhere by its expression path ("amount.amountMicros")
export type FormulaSqlColumn = {
  columnName: string;
  columnFieldMetadataType: FieldMetadataType;
  fieldName: string;
};
