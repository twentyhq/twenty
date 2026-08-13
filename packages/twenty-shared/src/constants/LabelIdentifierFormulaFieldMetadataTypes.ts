import { FieldMetadataType } from '@/types';

export const LABEL_IDENTIFIER_FORMULA_FIELD_METADATA_TYPES = [
  FieldMetadataType.DATE,
  FieldMetadataType.DATE_TIME,
  FieldMetadataType.FULL_NAME,
  FieldMetadataType.NUMBER,
  FieldMetadataType.NUMERIC,
  FieldMetadataType.RATING,
  FieldMetadataType.RELATION,
  FieldMetadataType.SELECT,
  FieldMetadataType.TEXT,
  FieldMetadataType.UUID,
] as const;
