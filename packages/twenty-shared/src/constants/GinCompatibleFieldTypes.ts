import { FieldMetadataType } from '../types/FieldMetadataType';

export const GIN_COMPATIBLE_FIELD_TYPES = new Set<FieldMetadataType>([
  FieldMetadataType.TS_VECTOR,
  FieldMetadataType.ARRAY,
  FieldMetadataType.MULTI_SELECT,
  FieldMetadataType.RAW_JSON,
]);
