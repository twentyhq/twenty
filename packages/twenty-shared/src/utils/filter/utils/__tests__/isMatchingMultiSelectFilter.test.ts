import { isMatchingMultiSelectFilter } from '@/utils/filter/utils/isMatchingMultiSelectFilter';

describe('isMatchingMultiSelectFilter', () => {
  describe('containsAny', () => {
    it('should return true when value contains every filter item', () => {
      expect(
        isMatchingMultiSelectFilter({
          multiSelectFilter: { containsAny: ['A', 'B'] },
          value: ['A', 'B', 'C'],
        }),
      ).toBe(true);
    });

    it('should return true when value contains only some of the filter items', () => {
      expect(
        isMatchingMultiSelectFilter({
          multiSelectFilter: { containsAny: ['A', 'D'] },
          value: ['A', 'B', 'C'],
        }),
      ).toBe(true);
    });

    it('should return true when value shares a single option with the filter', () => {
      expect(
        isMatchingMultiSelectFilter({
          multiSelectFilter: { containsAny: ['B'] },
          value: ['A', 'B', 'C'],
        }),
      ).toBe(true);
    });

    it('should return false when value shares no option with the filter', () => {
      expect(
        isMatchingMultiSelectFilter({
          multiSelectFilter: { containsAny: ['X', 'Y'] },
          value: ['A', 'B', 'C'],
        }),
      ).toBe(false);
    });

    it('should return false for an empty value array', () => {
      expect(
        isMatchingMultiSelectFilter({
          multiSelectFilter: { containsAny: ['A'] },
          value: [],
        }),
      ).toBe(false);
    });

    it('should return false for null value', () => {
      expect(
        isMatchingMultiSelectFilter({
          multiSelectFilter: { containsAny: ['A'] },
          value: null,
        }),
      ).toBe(false);
    });
  });

  describe('isEmptyArray', () => {
    it.each([
      { isEmptyArray: true, value: [], expected: true },
      { isEmptyArray: true, value: null, expected: true },
      { isEmptyArray: true, value: ['A'], expected: false },
      { isEmptyArray: false, value: [], expected: false },
      { isEmptyArray: false, value: null, expected: false },
      { isEmptyArray: false, value: ['A'], expected: true },
    ])(
      'should return $expected for isEmptyArray $isEmptyArray on $value',
      ({ isEmptyArray, value, expected }) => {
        expect(
          isMatchingMultiSelectFilter({
            multiSelectFilter: { isEmptyArray },
            value,
          }),
        ).toBe(expected);
      },
    );
  });

  describe('is', () => {
    it('should match NULL check', () => {
      expect(
        isMatchingMultiSelectFilter({
          multiSelectFilter: { is: 'NULL' },
          value: null,
        }),
      ).toBe(true);
    });

    it('should match NOT_NULL check', () => {
      expect(
        isMatchingMultiSelectFilter({
          multiSelectFilter: { is: 'NOT_NULL' },
          value: ['A'],
        }),
      ).toBe(true);
    });
  });

  describe('default', () => {
    it('should throw for unexpected filter', () => {
      expect(() =>
        isMatchingMultiSelectFilter({
          multiSelectFilter: {} as any,
          value: ['A'],
        }),
      ).toThrow('Unexpected value for multi-select filter');
    });
  });
});
