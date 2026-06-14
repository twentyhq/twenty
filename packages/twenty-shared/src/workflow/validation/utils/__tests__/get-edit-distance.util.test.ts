import { getEditDistance } from '../get-edit-distance.util';

describe('getEditDistance', () => {
  it('should return 0 for identical strings', () => {
    expect(getEditDistance('name', 'name')).toBe(0);
  });

  it('should count a single deletion', () => {
    expect(getEditDistance('name', 'nme')).toBe(1);
  });

  it('should count a single insertion', () => {
    expect(getEditDistance('nme', 'name')).toBe(1);
  });

  it('should count a single substitution', () => {
    expect(getEditDistance('firstName', 'firstname')).toBe(1);
  });

  it('should compute the classic kitten/sitting distance', () => {
    expect(getEditDistance('kitten', 'sitting')).toBe(3);
  });

  it('should handle empty strings', () => {
    expect(getEditDistance('', 'name')).toBe(4);
    expect(getEditDistance('name', '')).toBe(4);
    expect(getEditDistance('', '')).toBe(0);
  });
});
