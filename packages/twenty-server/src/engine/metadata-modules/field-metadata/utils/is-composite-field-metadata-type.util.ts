import { FieldMetadataType } from 'twenty-shared/types';

const COMPOSITE_FIELD_METADATA_TYPES: ReadonlySet<FieldMetadataType> = new Set([
  FieldMetadataType.CURRENCY,
  FieldMetadataType.FULL_NAME,
  FieldMetadataType.ADDRESS,
  FieldMetadataType.LINKS,
  FieldMetadataType.ACTOR,
  FieldMetadataType.EMAILS,
  FieldMetadataType.PHONES,
  FieldMetadataType.RICH_TEXT,
]);

export const isCompositeFieldMetadataType = (
  type: FieldMetadataType,
): type is
  | FieldMetadataType.CURRENCY
  | FieldMetadataType.FULL_NAME
  | FieldMetadataType.ADDRESS
  | FieldMetadataType.LINKS
  | FieldMetadataType.ACTOR
  | FieldMetadataType.EMAILS
  | FieldMetadataType.PHONES
  | FieldMetadataType.RICH_TEXT => {
  return COMPOSITE_FIELD_METADATA_TYPES.has(type);
};
