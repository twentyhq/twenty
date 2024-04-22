import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

export const isCompositeFieldMetadataType = (
  type: FieldMetadataType,
): type is
  | FieldMetadataType.LINK
  | FieldMetadataType.CURRENCY
  | FieldMetadataType.FULL_NAME => {
  return (
    type === FieldMetadataType.LINK ||
    type === FieldMetadataType.CURRENCY ||
    type === FieldMetadataType.FULL_NAME ||
    type === FieldMetadataType.ADDRESS ||
    type === FieldMetadataType.FILE
  );
};
