import { FieldMetadataType } from 'twenty-shared';

export type EnumFieldMetadataUnionType =
  | FieldMetadataType.RATING
  | FieldMetadataType.SELECT
  | FieldMetadataType.MULTI_SELECT;

export const isEnumFieldMetadataType = (
  type: FieldMetadataType,
): type is EnumFieldMetadataUnionType => {
  return (
    type === FieldMetadataType.RATING ||
    type === FieldMetadataType.SELECT ||
    type === FieldMetadataType.MULTI_SELECT
  );
};
