import { FieldMetadataType } from '@/types';

const NUMBER_FIELD_TYPES: FieldMetadataType[] = [
  FieldMetadataType.NUMBER,
  FieldMetadataType.NUMERIC,
  FieldMetadataType.CURRENCY,
  FieldMetadataType.RATING,
  FieldMetadataType.POSITION,
];

export const isFieldMetadataNumericKind = (
  fieldMetadataType: FieldMetadataType,
): boolean => {
  return NUMBER_FIELD_TYPES.includes(fieldMetadataType);
};
