import { FieldMetadataType } from 'twenty-shared/types';

export const RELATION_FIELD_TYPES = [
  FieldMetadataType.RELATION,
  FieldMetadataType.MORPH_RELATION,
] as const;

export type RelationFieldMetadataType = (typeof RELATION_FIELD_TYPES)[number];
