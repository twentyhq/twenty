import { FieldMetadataType } from 'twenty-shared/types';

const enumFieldTypes = [
  FieldMetadataType.SELECT,
  FieldMetadataType.MULTI_SELECT,
  FieldMetadataType.RATING,
] as const;

export type EnumFieldMetadataType = (typeof enumFieldTypes)[number];

export const ENUM_FIELD_TYPES: FieldMetadataType[] = [...enumFieldTypes];
