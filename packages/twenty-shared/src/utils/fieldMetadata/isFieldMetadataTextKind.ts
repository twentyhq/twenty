import { FieldMetadataType } from '@/types';

const TEXT_FIELD_TYPES: FieldMetadataType[] = [
  FieldMetadataType.TEXT,
  FieldMetadataType.RICH_TEXT,
];

export const isFieldMetadataTextKind = (
  fieldMetadataType: FieldMetadataType,
): boolean => {
  return TEXT_FIELD_TYPES.includes(fieldMetadataType);
};
