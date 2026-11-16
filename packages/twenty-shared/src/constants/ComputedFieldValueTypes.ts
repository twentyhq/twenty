import { FieldMetadataType } from '@/types/FieldMetadataType';

export const COMPUTED_FIELD_VALUE_TYPES = [
  FieldMetadataType.NUMBER,
  FieldMetadataType.TEXT,
  FieldMetadataType.BOOLEAN,
  FieldMetadataType.DATE,
  FieldMetadataType.DATE_TIME,
] as const satisfies FieldMetadataType[];
