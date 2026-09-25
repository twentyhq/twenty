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

    it('should match against the Postgres jsonb text representation', () => {
      const value = { tags: ['a', 'b'], name: 'Acme', ok: true };

      expect(
        isMatchingRawJsonFilter({
          rawJsonFilter: { like: '{"ok": true, "name": "Acme", %}' },
          value,
        }),
      ).toBe(true);

      expect(
        isMatchingRawJsonFilter({
          rawJsonFilter: { like: '%"tags": ["a", "b"]%' },
          value,
        }),
      ).toBe(true);
    });

    it('should be case sensitive', () => {
      expect(
        isMatchingRawJsonFilter({
          rawJsonFilter: { like: '%acme%' },
          value: { name: 'Acme' },
        }),
      ).toBe(false);
    });

    it('should match escaped characters as Postgres renders them', () => {
      expect(
        isMatchingRawJsonFilter({
          rawJsonFilter: { like: '%say \\\\"hi\\\\"%' },
          value: { note: 'say "hi"' },
        }),
      ).toBe(true);
    });

    it('should not match a null value', () => {
      expect(
        isMatchingRawJsonFilter({
          rawJsonFilter: { like: '%null%' },
          value: null,
        }),
      ).toBe(false);
    });
  });

  describe('ilike', () => {
    it('should match case insensitively', () => {
      expect(
        isMatchingRawJsonFilter({
          rawJsonFilter: { ilike: '%acme%' },
          value: { name: 'Acme' },
        }),
      ).toBe(true);
    });

    it('should not match a null value', () => {
      expect(
        isMatchingRawJsonFilter({
          rawJsonFilter: { ilike: '%null%' },
          value: null,
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
