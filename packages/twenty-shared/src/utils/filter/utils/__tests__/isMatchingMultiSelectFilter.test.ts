import { isMatchingMultiSelectFilter } from '@/utils/filter/utils/isMatchingMultiSelectFilter';

describe('isMatchingMultiSelectFilter', () => {
  describe('in', () => {
    it('should return true when at least one value is in the filter list', () => {
      expect(
        isMatchingMultiSelectFilter({
          multiSelectFilter: { in: ['A', 'B'] },
          value: ['A', 'C'],
        }),
      ).toBe(true);
    });

    it('should return false when no value is in the filter list', () => {
      expect(
        isMatchingMultiSelectFilter({
          multiSelectFilter: { in: ['A', 'B'] },
          value: ['C', 'D'],
        }),
      ).toBe(false);
    });

    it('should return false for null value', () => {
      expect(
        isMatchingMultiSelectFilter({
          multiSelectFilter: { in: ['A'] },
          value: null,
        }),
      ).toBe(false);
    });

    it('should return false for empty array value', () => {
      expect(
        isMatchingMultiSelectFilter({
          multiSelectFilter: { in: ['A'] },
          value: [],
        }),
      ).toBe(false);
    });
  });

  describe('containsAny', () => {
    it('should return true when value contains all filter items', () => {
      expect(
        isMatchingMultiSelectFilter({
          multiSelectFilter: { containsAny: ['A', 'B'] },
          value: ['A', 'B', 'C'],
        }),
      ).toBe(true);
    });

    it('should return false when value does not contain all filter items', () => {
      expect(
        isMatchingMultiSelectFilter({
          multiSelectFilter: { containsAny: ['A', 'D'] },
          value: ['A', 'B', 'C'],
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
