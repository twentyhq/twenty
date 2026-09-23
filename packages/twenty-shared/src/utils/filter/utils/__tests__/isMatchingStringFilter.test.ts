import { isMatchingStringFilter } from '@/utils/filter/utils/isMatchingStringFilter';

describe('isMatchingStringFilter', () => {
  describe('eq', () => {
    it('value equals eq filter', () => {
      expect(
        isMatchingStringFilter({ stringFilter: { eq: 'test' }, value: 'test' }),
      ).toBe(true);
    });

    it('value does not equals eq filter', () => {
      expect(
        isMatchingStringFilter({
          stringFilter: { eq: 'test' },
          value: 'other',
        }),
      ).toBe(false);
    });
  });

  describe('neq', () => {
    it('value does not equal neq filter', () => {
      expect(
        isMatchingStringFilter({
          stringFilter: { neq: 'test' },
          value: 'other',
        }),
      ).toBe(true);
    });

    it('value equals neq filter', () => {
      expect(
        isMatchingStringFilter({
          stringFilter: { neq: 'test' },
          value: 'test',
        }),
      ).toBe(false);
    });
  });

  describe.each(['like', 'ilike'])('%s', (operator) => {
    it.each([
      { pattern: 'te%', value: 'test', expected: true },
      { pattern: 'ab%', value: 'test', expected: false },
      { pattern: '', value: '', expected: true },
      { pattern: '', value: '\n', expected: false },
      { pattern: '%', value: '', expected: true },
      { pattern: '_', value: '', expected: false },
      { pattern: 'a_c', value: 'abc', expected: true },
      { pattern: 'a_c', value: 'ac', expected: false },
      { pattern: 'a_c', value: 'abxc', expected: false },
      { pattern: 'a_c', value: 'abc\n', expected: false },
      { pattern: 'a_c', value: 'a\nc', expected: true },
      { pattern: 'a_c', value: 'a\rc', expected: true },
      { pattern: 'a_c', value: 'a\u2028c', expected: true },
      { pattern: 'a_c', value: 'a\u{1F600}c', expected: true },
      { pattern: 'a__c', value: 'a\u{1F600}c', expected: false },
      { pattern: 'a__c', value: 'a\u{1F600}\u{1F600}c', expected: true },
      { pattern: 'a%c', value: 'ac', expected: true },
      { pattern: 'a%c', value: 'a\nc', expected: true },
      { pattern: 'a%c', value: 'a\u{1F600}c', expected: true },
      { pattern: 'a%c', value: 'a\nc\n', expected: false },
      { pattern: '50\\%', value: '50%', expected: true },
      { pattern: '50\\%', value: '50\n', expected: false },
      { pattern: 'a\\_c', value: 'a_c', expected: true },
      { pattern: 'a\\_c', value: 'axc', expected: false },
      { pattern: 'a\\bc', value: 'abc', expected: true },
      { pattern: 'a\\_%', value: 'a_b\nc', expected: true },
      { pattern: 'a\\\\', value: 'a\\', expected: true },
      { pattern: 'a\\\\%', value: 'a\\bc', expected: true },
      { pattern: 'a\\\nc', value: 'a\nc', expected: true },
      { pattern: 'a\\😀c', value: 'a😀c', expected: true },
      { pattern: '.*+?^${}()|[]', value: '.*+?^${}()|[]', expected: true },
      { pattern: 'a.c', value: 'abc', expected: false },
    ])(
      'matches $pattern against $value: $expected',
      ({ pattern, value, expected }) => {
        expect(
          isMatchingStringFilter({
            stringFilter: { [operator]: pattern },
            value,
          }),
        ).toBe(expected);
      },
    );

    it.each(['\\', 'a\\', 'a\\\\\\'])(
      'rejects dangling escape in %s',
      (pattern) => {
        expect(() =>
          isMatchingStringFilter({
            stringFilter: { [operator]: pattern },
            value: pattern,
          }),
        ).toThrow('LIKE pattern must not end with escape character');
      },
    );
  });

  it('keeps LIKE case sensitive', () => {
    expect(
      isMatchingStringFilter({ stringFilter: { like: 'A_C' }, value: 'abc' }),
    ).toBe(false);
  });

  it('matches ILIKE case insensitively', () => {
    expect(
      isMatchingStringFilter({ stringFilter: { ilike: 'A_C' }, value: 'abC' }),
    ).toBe(true);
  });

  it('does not broaden ILIKE matching with Unicode case folding', () => {
    expect(
      isMatchingStringFilter({ stringFilter: { ilike: 's' }, value: 'ſ' }),
    ).toBe(false);
  });

  describe('in', () => {
    it('value is in the array', () => {
      expect(
        isMatchingStringFilter({
          stringFilter: { in: ['test', 'example'] },
          value: 'test',
        }),
      ).toBe(true);
    });

    it('value is not in the array', () => {
      expect(
        isMatchingStringFilter({
          stringFilter: { in: ['example', 'sample'] },
          value: 'test',
        }),
      ).toBe(false);
    });
  });

  describe('is', () => {
    it('value is NULL', () => {
      expect(
        isMatchingStringFilter({
          stringFilter: { is: 'NULL' },
          value: null as any,
        }),
      ).toBe(true);
    });

    it('value is NOT_NULL', () => {
      expect(
        isMatchingStringFilter({
          stringFilter: { is: 'NOT_NULL' },
          value: 'test',
        }),
      ).toBe(true);
    });
  });

  describe('regex', () => {
    it('value matches regex pattern', () => {
      expect(
        isMatchingStringFilter({
          stringFilter: { regex: '^test$' },
          value: 'test',
        }),
      ).toBe(true);
    });

    it('value does not match regex pattern', () => {
      expect(
        isMatchingStringFilter({
          stringFilter: { regex: '^test$' },
          value: 'testing',
        }),
      ).toBe(false);
    });
  });

  describe('iregex', () => {
    it('value matches iregex pattern case insensitively', () => {
      expect(
        isMatchingStringFilter({
          stringFilter: { iregex: '^test$' },
          value: 'Test',
        }),
      ).toBe(true);
    });

    it('value does not match iregex pattern', () => {
      expect(
        isMatchingStringFilter({
          stringFilter: { iregex: '^test$' },
          value: 'testing',
        }),
      ).toBe(false);
    });
  });

  describe('startsWith', () => {
    it('value starts with the startsWith filter', () => {
      expect(
        isMatchingStringFilter({
          stringFilter: { startsWith: 'te' },
          value: 'test',
        }),
      ).toBe(true);
    });

    it('value does not start with the startsWith filter', () => {
      expect(
        isMatchingStringFilter({
          stringFilter: { startsWith: 'st' },
          value: 'test',
        }),
      ).toBe(false);
    });
  });
});
