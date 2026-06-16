import { isMatchingTSVectorFilter } from '@/utils/filter/utils/isMatchingTSVectorFilter';

describe('isMatchingTSVectorFilter', () => {
  describe('search', () => {
    it('value matches search filter', () => {
      expect(
        isMatchingTSVectorFilter({
          tsVectorFilter: { search: 'test' },
          value: 'test document',
        }),
      ).toBe(true);
    });

    it('value does not match search filter', () => {
      expect(
        isMatchingTSVectorFilter({
          tsVectorFilter: { search: 'missing' },
          value: 'test document',
        }),
      ).toBe(false);
    });

    it('search is case insensitive', () => {
      expect(
        isMatchingTSVectorFilter({
          tsVectorFilter: { search: 'TEST' },
          value: 'test document',
        }),
      ).toBe(true);
    });

    it('search matches partial words', () => {
      expect(
        isMatchingTSVectorFilter({
          tsVectorFilter: { search: 'doc' },
          value: 'test document',
        }),
      ).toBe(true);
    });

    it('search matches multiple words', () => {
      expect(
        isMatchingTSVectorFilter({
          tsVectorFilter: { search: 'test doc' },
          value: 'test document',
        }),
      ).toBe(true);
    });
  });

  describe('type safety', () => {
    it('returns false when search is a number instead of string', () => {
      expect(
        isMatchingTSVectorFilter({
          tsVectorFilter: { search: 123 as any },
          value: 'test document',
        }),
      ).toBe(false);
    });

    it('returns false when search is null', () => {
      expect(
        isMatchingTSVectorFilter({
          tsVectorFilter: { search: null as any },
          value: 'test document',
        }),
      ).toBe(false);
    });

    it('returns false when search is an object', () => {
      expect(
        isMatchingTSVectorFilter({
          tsVectorFilter: { search: {} as any },
          value: 'test document',
        }),
      ).toBe(false);
    });

    it('returns false when value is not a string', () => {
      expect(
        isMatchingTSVectorFilter({
          tsVectorFilter: { search: 'test' },
          value: 123 as any,
        }),
      ).toBe(false);
    });

    it('returns false when both search and value are non-string', () => {
      expect(
        isMatchingTSVectorFilter({
          tsVectorFilter: { search: 123 as any },
          value: 456 as any,
        }),
      ).toBe(false);
    });
  });

  describe('error handling', () => {
    it('should throw error for unknown filter type', () => {
      expect(() =>
        isMatchingTSVectorFilter({
          tsVectorFilter: { unknownFilter: 'test' } as any,
          value: 'test document',
        }),
      ).toThrow('Unexpected value for ts_vector filter');
    });
  });
});
