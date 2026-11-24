import { FieldMetadataType } from '@/types';

export const FIELD_METADATA_TYPES_NOT_WRITABLE = new Set<FieldMetadataType>([
  FieldMetadataType.TS_VECTOR,
  FieldMetadataType.ROLLUP,
]);
