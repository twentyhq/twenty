import { type FieldMetadataType } from 'twenty-shared/types';

export type ComputedFieldSchemaField = {
  name: string;
  type: FieldMetadataType;
  computation?: unknown;
};
