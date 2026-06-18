import { FieldMetadataType } from '@/types';

export const isFieldMetadataEnumKind = (
  fieldMetadataType: FieldMetadataType,
): boolean => {
  return (
    fieldMetadataType === FieldMetadataType.SELECT ||
    fieldMetadataType === FieldMetadataType.MULTI_SELECT ||
    fieldMetadataType === FieldMetadataType.RATING
  );
};
