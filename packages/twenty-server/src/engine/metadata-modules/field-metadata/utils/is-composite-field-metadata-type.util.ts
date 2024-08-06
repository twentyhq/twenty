import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

export const isCompositeFieldMetadataType = (
  type: FieldMetadataType,
): type is
  | FieldMetadataType.LINK
  | FieldMetadataType.CURRENCY
  | FieldMetadataType.FULL_NAME
  | FieldMetadataType.ADDRESS
  | FieldMetadataType.LINKS
  | FieldMetadataType.ACTOR => {
  return [
    FieldMetadataType.LINK,
    FieldMetadataType.CURRENCY,
    FieldMetadataType.FULL_NAME,
    FieldMetadataType.ADDRESS,
    FieldMetadataType.LINKS,
    FieldMetadataType.ACTOR,
  ].includes(type);
};
