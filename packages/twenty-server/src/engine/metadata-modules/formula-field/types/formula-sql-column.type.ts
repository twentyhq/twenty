import { type FieldMetadataType } from 'twenty-shared/types';

export type FormulaSqlColumn = {
  columnName: string;
  columnFieldMetadataType: FieldMetadataType;
  fieldUniversalIdentifier: string;
};
