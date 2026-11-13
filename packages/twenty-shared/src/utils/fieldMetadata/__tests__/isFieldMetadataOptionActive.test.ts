import { isFieldMetadataOptionActive } from '../isFieldMetadataOptionActive';

describe('isFieldMetadataOptionActive', () => {
  it.each([{}, { isActive: true }, { isActive: undefined }, { isActive: null }])(
    'should return true for %j',
    (option) => {
      expect(isFieldMetadataOptionActive(option)).toBe(true);
    },
  );

  it('should return false when isActive is false', () => {
    expect(isFieldMetadataOptionActive({ isActive: false })).toBe(false);
  });
});
