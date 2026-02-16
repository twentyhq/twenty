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
