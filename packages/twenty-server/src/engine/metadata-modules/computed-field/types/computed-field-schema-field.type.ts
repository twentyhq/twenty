import {
  type FieldMetadataComputation,
  type FieldMetadataType,
} from 'twenty-shared/types';

export type ComputedFieldSchemaField = {
  name: string;
  type: FieldMetadataType;
  computation?: FieldMetadataComputation | null;
};
