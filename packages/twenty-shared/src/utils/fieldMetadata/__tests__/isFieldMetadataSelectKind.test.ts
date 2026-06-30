import { FieldMetadataType } from '@/types';
import { isFieldMetadataSelectKind } from '../isFieldMetadataSelectKind';

describe('isFieldMetadataSelectKind', () => {
  it.each([FieldMetadataType.SELECT, FieldMetadataType.MULTI_SELECT])(
    'should return true for %s',
    (type) => {
      expect(isFieldMetadataSelectKind(type)).toBe(true);
    },
  );

  it.each([FieldMetadataType.TEXT, FieldMetadataType.NUMBER])(
    'should return false for %s',
    (type) => {
      expect(isFieldMetadataSelectKind(type)).toBe(false);
    },
  );
});
