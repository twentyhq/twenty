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

  describe('containsExactly', () => {
    it('should return true when value holds exactly the filter options', () => {
      expect(
        isMatchingMultiSelectFilter({
          multiSelectFilter: { containsExactly: ['A', 'B'] },
          value: ['A', 'B'],
        }),
      ).toBe(true);
    });

    it('should ignore option order', () => {
      expect(
        isMatchingMultiSelectFilter({
          multiSelectFilter: { containsExactly: ['A', 'B'] },
          value: ['B', 'A'],
        }),
      ).toBe(true);
    });

    it('should return false when value holds an extra option', () => {
      expect(
        isMatchingMultiSelectFilter({
          multiSelectFilter: { containsExactly: ['A', 'B'] },
          value: ['A', 'B', 'C'],
        }),
      ).toBe(false);
    });

    it('should return false when value misses one of the filter options', () => {
      expect(
        isMatchingMultiSelectFilter({
          multiSelectFilter: { containsExactly: ['A', 'B'] },
          value: ['A'],
        }),
      ).toBe(false);
    });

    it('should return false for an empty value array', () => {
      expect(
        isMatchingMultiSelectFilter({
          multiSelectFilter: { containsExactly: ['A'] },
          value: [],
        }),
      ).toBe(false);
    });

    it('should return false for null value', () => {
      expect(
        isMatchingMultiSelectFilter({
          multiSelectFilter: { containsExactly: ['A'] },
          value: null,
        }),
      ).toBe(false);
    });
  });

  describe('isEmptyArray', () => {
    it('should return true for empty array', () => {
      expect(
        isMatchingMultiSelectFilter({
          multiSelectFilter: { isEmptyArray: true },
          value: [],
        }),
      ).toBe(true);
    });

    it('should return false for non-empty array', () => {
      expect(
        isMatchingMultiSelectFilter({
          multiSelectFilter: { isEmptyArray: true },
          value: ['A'],
        }),
      ).toBe(false);
    });
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
