import { FieldMetadataType } from '@/types';

export const isFieldMetadataSelectKind = (
  fieldMetadataType: FieldMetadataType,
): boolean => {
  return (
    fieldMetadataType === FieldMetadataType.SELECT ||
    fieldMetadataType === FieldMetadataType.MULTI_SELECT
  );
};
