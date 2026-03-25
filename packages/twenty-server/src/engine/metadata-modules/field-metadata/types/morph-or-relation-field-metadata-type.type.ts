import { FieldMetadataType } from 'twenty-shared/types';

export const MORPH_OR_RELATION_FIELD_TYPES = [
  FieldMetadataType.RELATION,
  FieldMetadataType.MORPH_RELATION,
] as const;

export type MorphOrRelationFieldMetadataType =
  (typeof MORPH_OR_RELATION_FIELD_TYPES)[number];
