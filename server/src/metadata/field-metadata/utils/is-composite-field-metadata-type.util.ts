import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';

export const isCompositeFieldMetadataType = (
  type: FieldMetadataType,
): type is
  | FieldMetadataType.LINK
  | FieldMetadataType.CURRENCY
  | FieldMetadataType.FULL_NAME => {
  return (
    type === FieldMetadataType.LINK ||
    type === FieldMetadataType.CURRENCY ||
    type === FieldMetadataType.FULL_NAME
  );
};
