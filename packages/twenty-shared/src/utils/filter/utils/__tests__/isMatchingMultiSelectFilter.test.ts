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

  describe('in, eq, neq and array compatibility', () => {
    it('should match when in list overlaps with value', () => {
      expect(
        isMatchingMultiSelectFilter({
          multiSelectFilter: { in: ['A', 'B'] } as any,
          value: ['A', 'C'],
        }),
      ).toBe(true);

      expect(
        isMatchingMultiSelectFilter({
          multiSelectFilter: { in: ['X', 'Y'] } as any,
          value: ['A', 'C'],
        }),
      ).toBe(false);
    });

    it('should match when eq equals an element in value', () => {
      expect(
        isMatchingMultiSelectFilter({
          multiSelectFilter: { eq: 'A' } as any,
          value: ['A', 'C'],
        }),
      ).toBe(true);

      expect(
        isMatchingMultiSelectFilter({
          multiSelectFilter: { eq: 'Z' } as any,
          value: ['A', 'C'],
        }),
      ).toBe(false);
    });

    it('should match when neq is not in value', () => {
      expect(
        isMatchingMultiSelectFilter({
          multiSelectFilter: { neq: 'Z' } as any,
          value: ['A', 'C'],
        }),
      ).toBe(true);

      expect(
        isMatchingMultiSelectFilter({
          multiSelectFilter: { neq: 'A' } as any,
          value: ['A', 'C'],
        }),
      ).toBe(false);
    });

    it('should match when raw array filter overlaps with value', () => {
      expect(
        isMatchingMultiSelectFilter({
          multiSelectFilter: ['A', 'B'] as any,
          value: ['A', 'C'],
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
