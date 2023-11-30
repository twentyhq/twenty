import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';

export const isEnumFieldMetadataType = (
  type: FieldMetadataType,
): type is
  | FieldMetadataType.RATING
  | FieldMetadataType.SELECT
  | FieldMetadataType.MULTI_SELECT => {
  return (
    type === FieldMetadataType.RATING ||
    type === FieldMetadataType.SELECT ||
    type === FieldMetadataType.MULTI_SELECT
  );
};
