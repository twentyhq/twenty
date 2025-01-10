import { FieldMetadataType } from 'twenty-shared';

export const isCompositeFieldMetadataType = (
  type: FieldMetadataType,
): type is
  | FieldMetadataType.CURRENCY
  | FieldMetadataType.FULL_NAME
  | FieldMetadataType.ADDRESS
  | FieldMetadataType.LINKS
  | FieldMetadataType.ACTOR
  | FieldMetadataType.EMAILS
  | FieldMetadataType.PHONES => {
  return [
    FieldMetadataType.CURRENCY,
    FieldMetadataType.FULL_NAME,
    FieldMetadataType.ADDRESS,
    FieldMetadataType.LINKS,
    FieldMetadataType.ACTOR,
    FieldMetadataType.EMAILS,
    FieldMetadataType.PHONES,
  ].includes(type);
};
