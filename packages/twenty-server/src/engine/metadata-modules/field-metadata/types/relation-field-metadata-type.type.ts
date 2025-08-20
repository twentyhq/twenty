import { FieldMetadataType } from 'twenty-shared/types';

const relationFieldTypes = [
  FieldMetadataType.RELATION,
  FieldMetadataType.MORPH_RELATION,
] as const;

export type RelationFieldMetadataType = (typeof relationFieldTypes)[number];

export const RELATION_FIELD_TYPES: FieldMetadataType[] = [
  ...relationFieldTypes,
];
