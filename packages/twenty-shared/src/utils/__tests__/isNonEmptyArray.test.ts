import { isNonEmptyArray } from '@/utils/array/isNonEmptyArray';

describe('isNonEmptyArray', () => {
  it('should return true for a non empty array', () => {
    expect(isNonEmptyArray([1])).toBe(true);
  });

  it('should return false for an empty array', () => {
    expect(isNonEmptyArray([])).toBe(false);
  });

  it('should return false for a null value', () => {
    expect(isNonEmptyArray(null)).toBe(false);
  });

  it('should return false for an undefined value', () => {
    expect(isNonEmptyArray(undefined)).toBe(false);
  });
});
