import { FieldMetadataType } from 'twenty-shared/types';

export const COMPUTED_FIELD_SCALAR_TYPES = [
  FieldMetadataType.NUMBER,
  FieldMetadataType.TEXT,
  FieldMetadataType.BOOLEAN,
  FieldMetadataType.DATE,
  FieldMetadataType.DATE_TIME,
] as const satisfies FieldMetadataType[];
