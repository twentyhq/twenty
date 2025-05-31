import { isDefined } from 'class-validator';
import { FieldMetadataType } from 'twenty-shared/types';
export const fieldMetadataEnumTypes = [
  FieldMetadataType.MULTI_SELECT,
  FieldMetadataType.SELECT,
  FieldMetadataType.RATING,
] as const;

export type EnumFieldMetadataUnionType =
  (typeof fieldMetadataEnumTypes)[number];

export const isEnumFieldMetadataType = (
  type: FieldMetadataType,
): type is EnumFieldMetadataUnionType =>
  isDefined(fieldMetadataEnumTypes.find((el) => type === el));
