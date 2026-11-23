import { FieldMetadataType } from '@/types/FieldMetadataType';

export const ROLLUP_RESULT_FIELD_METADATA_TYPES = [
  FieldMetadataType.NUMBER,
  FieldMetadataType.DATE,
  FieldMetadataType.DATE_TIME,
] as const satisfies FieldMetadataType[];
