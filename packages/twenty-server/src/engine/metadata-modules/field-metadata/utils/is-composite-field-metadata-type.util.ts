import { FieldMetadataType } from 'twenty-shared/types';
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
  | FieldMetadataType.RICH_TEXT_V2
  | FieldMetadataType.PDF
  | FieldMetadataType.IMAGE => {
  return [
    FieldMetadataType.CURRENCY,
    FieldMetadataType.FULL_NAME,
    FieldMetadataType.ADDRESS,
    FieldMetadataType.LINKS,
    FieldMetadataType.ACTOR,
    FieldMetadataType.EMAILS,
    FieldMetadataType.PHONES,
    FieldMetadataType.RICH_TEXT_V2,
    FieldMetadataType.PDF,
    FieldMetadataType.IMAGE,
  ].includes(type);
};
