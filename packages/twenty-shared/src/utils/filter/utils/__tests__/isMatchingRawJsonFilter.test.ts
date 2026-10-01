import { isMatchingRawJsonFilter } from '@/utils/filter/utils/isMatchingRawJsonFilter';

describe('isMatchingRawJsonFilter', () => {
  describe('like', () => {
    it('should match using wildcard pattern', () => {
      expect(
        isMatchingRawJsonFilter({
          rawJsonFilter: { like: '%test%' },
          value: 'some test value',
        }),
      ).toBe(true);
    });

    it('should not match when pattern does not match', () => {
      expect(
        isMatchingRawJsonFilter({
          rawJsonFilter: { like: '%xyz%' },
          value: 'some test value',
        }),
      ).toBe(false);
    });

    it('should treat regex metacharacters in the pattern literally', () => {
      expect(() =>
        isMatchingRawJsonFilter({
          rawJsonFilter: { like: '%(%' },
          value: 'some (test) value',
        }),
      ).not.toThrow();

      expect(
        isMatchingRawJsonFilter({
          rawJsonFilter: { like: '%(test)%' },
          value: 'some (test) value',
        }),
      ).toBe(true);

      expect(
        isMatchingRawJsonFilter({
          rawJsonFilter: { like: '%a.c%' },
          value: 'abc',
        }),
      ).toBe(false);
    });

    it('should match across lines', () => {
      expect(
        isMatchingRawJsonFilter({
          rawJsonFilter: { like: '%value%' },
          value: { key: 'value' } as any,
        }),
      ).toBe(true);
    });
  });

  describe('is', () => {
    it('should match NULL check', () => {
      expect(
        isMatchingRawJsonFilter({
          rawJsonFilter: { is: 'NULL' },
          value: null as any,
        }),
      ).toBe(true);
    });

    it('should match NOT_NULL check', () => {
      expect(
        isMatchingRawJsonFilter({
          rawJsonFilter: { is: 'NOT_NULL' },
          value: '{"key": "val"}',
        }),
      ).toBe(true);
    });
  });

  describe('default', () => {
    it('should throw for unexpected filter', () => {
      expect(() =>
        isMatchingRawJsonFilter({
          rawJsonFilter: {} as any,
          value: 'test',
        }),
      ).toThrow('Unexpected value for string filter');
    });
  });
});
