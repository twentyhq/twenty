import { FieldMetadataType } from '@/types/FieldMetadataType';

export const FORMULA_FIELD_METADATA_TYPES = [
  FieldMetadataType.TEXT,
  FieldMetadataType.NUMBER,
  FieldMetadataType.BOOLEAN,
  FieldMetadataType.DATE,
  FieldMetadataType.DATE_TIME,
  FieldMetadataType.SELECT,
  FieldMetadataType.RATING,
  FieldMetadataType.CURRENCY,
] as const;
