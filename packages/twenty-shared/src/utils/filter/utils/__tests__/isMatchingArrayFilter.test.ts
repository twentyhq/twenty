import { isMatchingArrayFilter } from '@/utils/filter/utils/isMatchingArrayFilter';

describe('isMatchingArrayFilter', () => {
  describe('is filter', () => {
    it('should return true when checking for NULL and value is null', () => {
      expect(
        isMatchingArrayFilter({
          arrayFilter: { is: 'NULL' },
          value: null,
        }),
      ).toBe(true);
    });

    it('should return false when checking for NULL and value is not null', () => {
      expect(
        isMatchingArrayFilter({
          arrayFilter: { is: 'NULL' },
          value: ['test'],
        }),
      ).toBe(false);
    });

    it('should return true when checking for NOT_NULL and value is not null', () => {
      expect(
        isMatchingArrayFilter({
          arrayFilter: { is: 'NOT_NULL' },
          value: ['test'],
        }),
      ).toBe(true);
    });

    it('should return false when checking for NOT_NULL and value is null', () => {
      expect(
        isMatchingArrayFilter({
          arrayFilter: { is: 'NOT_NULL' },
          value: null,
        }),
      ).toBe(false);
    });
  });

  describe('isEmptyArray filter', () => {
    it('should return true when array is empty and checking for empty array', () => {
      expect(
        isMatchingArrayFilter({
          arrayFilter: { isEmptyArray: true },
          value: [],
        }),
      ).toBe(true);
    });

    it('should return false when array is not empty and checking for empty array', () => {
      expect(
        isMatchingArrayFilter({
          arrayFilter: { isEmptyArray: true },
          value: ['test'],
        }),
      ).toBe(false);
    });

    it('should return false when value is null and checking for empty array', () => {
      expect(
        isMatchingArrayFilter({
          arrayFilter: { isEmptyArray: true },
          value: null,
        }),
      ).toBe(false);
    });
  });

  describe('containsIlike filter', () => {
    it.each([
      { pattern: '%', value: [], expected: false },
      { pattern: '%', value: [''], expected: true },
      { pattern: '', value: ['item'], expected: false },
      { pattern: '', value: [''], expected: true },
      { pattern: '%user-1%', value: ['other', 'user-1'], expected: true },
      { pattern: 'a_c', value: ['abc'], expected: true },
      { pattern: 'a_c', value: ['abxc'], expected: false },
      { pattern: 'a_c', value: ['a😀c'], expected: true },
      { pattern: '%foo%', value: ['before\nfoo\nafter'], expected: true },
      { pattern: 'a\\_c', value: ['a_c'], expected: true },
      { pattern: 'a\\_c', value: ['abc'], expected: false },
      { pattern: '50\\%', value: ['50%'], expected: true },
      { pattern: '50\\%', value: ['500'], expected: false },
      { pattern: 'a.c', value: ['abc'], expected: false },
      { pattern: 'a.c', value: ['a.c'], expected: true },
      { pattern: 'a\\', value: [], expected: false },
      { pattern: 'a\\', value: null, expected: false },
    ])(
      'matches $pattern against $value: $expected',
      ({ pattern, value, expected }) => {
        expect(
          isMatchingArrayFilter({
            arrayFilter: { containsIlike: pattern },
            value,
          }),
        ).toBe(expected);
      },
    );

    it('rejects a dangling escape when evaluating an array item', () => {
      expect(() =>
        isMatchingArrayFilter({
          arrayFilter: { containsIlike: 'a\\' },
          value: ['a\\'],
        }),
      ).toThrow('LIKE pattern must not end with escape character');
    });

    it('should return true when array contains item matching case-insensitive search', () => {
      expect(
        isMatchingArrayFilter({
          arrayFilter: { containsIlike: '%TEST%' },
          value: ['test item'],
        }),
      ).toBe(true);
    });

    it('should return false when array does not contain item matching search', () => {
      expect(
        isMatchingArrayFilter({
          arrayFilter: { containsIlike: '%missing%' },
          value: ['test item'],
        }),
      ).toBe(false);
    });

    it('should return false when value is null and using containsIlike', () => {
      expect(
        isMatchingArrayFilter({
          arrayFilter: { containsIlike: '%test%' },
          value: null,
        }),
      ).toBe(false);
    });

    it('should match partial strings case-insensitively', () => {
      expect(
        isMatchingArrayFilter({
          arrayFilter: { containsIlike: '%TE%' },
          value: ['Test Item', 'Another Item'],
        }),
      ).toBe(true);
    });

    it('should treat percent signs as SQL ILIKE wildcards', () => {
      expect(
        isMatchingArrayFilter({
          arrayFilter: { containsIlike: '%user-1%' },
          value: ['user-1'],
        }),
      ).toBe(true);

      expect(
        isMatchingArrayFilter({
          arrayFilter: { containsIlike: '%user-1%' },
          value: ['user-2'],
        }),
      ).toBe(false);
    });

    it('should treat a pattern without percent signs as a whole-string ILIKE match', () => {
      expect(
        isMatchingArrayFilter({
          arrayFilter: { containsIlike: 'test' },
          value: ['TEST'],
        }),
      ).toBe(true);

      expect(
        isMatchingArrayFilter({
          arrayFilter: { containsIlike: 'test' },
          value: ['test item'],
        }),
      ).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should throw error for invalid filter', () => {
      expect(() =>
        isMatchingArrayFilter({
          arrayFilter: {},
          value: [],
        }),
      ).toThrow('Unexpected value for array filter');
    });

    it('should throw error for unknown filter type', () => {
      expect(() =>
        isMatchingArrayFilter({
          arrayFilter: { unknownFilter: 'test' } as any,
          value: [],
        }),
      ).toThrow('Unexpected value for array filter');
    });
  });
});
