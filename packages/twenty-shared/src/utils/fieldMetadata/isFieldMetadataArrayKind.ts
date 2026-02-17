import { FieldMetadataType } from '@/types';

export const isFieldMetadataArrayKind = (
  fieldMetadataType: FieldMetadataType,
): boolean => {
  return (
    fieldMetadataType === FieldMetadataType.MULTI_SELECT ||
    fieldMetadataType === FieldMetadataType.ARRAY
  );
};
