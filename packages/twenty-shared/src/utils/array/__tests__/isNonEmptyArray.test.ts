import { isNonEmptyArray } from '@/utils/array/isNonEmptyArray';

describe('isNonEmptyArray', () => {
  it('should return false for empty, null and undefined arrays', () => {
    expect(isNonEmptyArray([])).toBe(false);
    expect(isNonEmptyArray(null)).toBe(false);
    expect(isNonEmptyArray(undefined)).toBe(false);
  });

  it('should return true and expose a defined first element', () => {
    const values: string[] = ['first', 'second'];

    expect(isNonEmptyArray(values)).toBe(true);

    if (isNonEmptyArray(values)) {
      const firstValue: string = values[0];

      expect(firstValue).toBe('first');
    }
  });

  it('should keep a narrowed readonly array readonly', () => {
    const values: readonly string[] = Object.freeze(['first']);

    if (isNonEmptyArray(values)) {
      expect(() => {
        // @ts-expect-error narrowing must not hand out mutators on a readonly array
        values.push('second');
      }).toThrow();
    }

    expect(values).toHaveLength(1);
  });
});
