import { FieldMetadataType } from '@/types';
import { isFieldMetadataNumericKind } from '../isFieldMetadataNumericKind';

describe('isFieldMetadataNumericKind', () => {
  it.each([
    FieldMetadataType.NUMBER,
    FieldMetadataType.NUMERIC,
    FieldMetadataType.CURRENCY,
    FieldMetadataType.RATING,
    FieldMetadataType.POSITION,
  ])('should return true for %s', (type) => {
    expect(isFieldMetadataNumericKind(type)).toBe(true);
  });

  it.each([FieldMetadataType.TEXT, FieldMetadataType.SELECT])(
    'should return false for %s',
    (type) => {
      expect(isFieldMetadataNumericKind(type)).toBe(false);
    },
  );
});
