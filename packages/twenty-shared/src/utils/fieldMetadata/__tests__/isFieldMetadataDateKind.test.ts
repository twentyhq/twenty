import { FieldMetadataType } from '@/types';
import { isFieldMetadataDateKind } from '@/utils/fieldMetadata/isFieldMetadataDateKind';

describe('isFieldMetadataDateKind', () => {
  it('should return true for DATE type', () => {
    expect(isFieldMetadataDateKind(FieldMetadataType.DATE)).toBe(true);
  });

  it('should return true for DATE_TIME type', () => {
    expect(isFieldMetadataDateKind(FieldMetadataType.DATE_TIME)).toBe(true);
  });

  it('should return false for TEXT type', () => {
    expect(isFieldMetadataDateKind(FieldMetadataType.TEXT)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isFieldMetadataDateKind(undefined)).toBe(false);
  });
});
