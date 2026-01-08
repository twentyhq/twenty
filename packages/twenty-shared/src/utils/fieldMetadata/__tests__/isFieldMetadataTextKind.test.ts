import { FieldMetadataType } from '@/types';
import { isFieldMetadataTextKind } from '../isFieldMetadataTextKind';

describe('isFieldMetadataTextKind', () => {
  it.each([
    FieldMetadataType.TEXT,
    FieldMetadataType.RICH_TEXT,
    FieldMetadataType.RICH_TEXT_V2,
  ])('should return true for %s', (type) => {
    expect(isFieldMetadataTextKind(type)).toBe(true);
  });

  it.each([FieldMetadataType.NUMBER, FieldMetadataType.SELECT])(
    'should return false for %s',
    (type) => {
      expect(isFieldMetadataTextKind(type)).toBe(false);
    },
  );
});
