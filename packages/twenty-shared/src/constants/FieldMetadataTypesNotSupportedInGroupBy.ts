import { FieldMetadataType } from '@/types';

export const FIELD_METADATA_TYPES_NOT_SUPPORTED_IN_GROUP_BY =
  new Set<FieldMetadataType>([
    FieldMetadataType.TS_VECTOR,
    FieldMetadataType.RAW_JSON,
    FieldMetadataType.FILES,
    FieldMetadataType.POSITION,
    FieldMetadataType.MORPH_RELATION,
  ]);
