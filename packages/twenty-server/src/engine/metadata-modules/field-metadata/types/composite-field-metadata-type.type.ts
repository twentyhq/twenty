import { FieldMetadataType } from 'twenty-shared/types';

const compositeFieldTypes = [
  FieldMetadataType.ADDRESS,
  FieldMetadataType.CURRENCY,
  FieldMetadataType.FULL_NAME,
  FieldMetadataType.LINKS,
  FieldMetadataType.EMAILS,
  FieldMetadataType.PHONES,
  FieldMetadataType.RICH_TEXT,
  FieldMetadataType.ACTOR,
] as const;

export type CompositeFieldMetadataType = (typeof compositeFieldTypes)[number];

export const COMPOSITE_FIELD_TYPES: FieldMetadataType[] = [
  ...compositeFieldTypes,
];
