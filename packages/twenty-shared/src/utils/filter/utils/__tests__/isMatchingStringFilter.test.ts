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

  describe('like', () => {
    it('value matches like pattern', () => {
      expect(
        isMatchingStringFilter({
          stringFilter: { like: 'te%' },
          value: 'test',
        }),
      ).toBe(true);
    });

    it('value does not match like pattern', () => {
      expect(
        isMatchingStringFilter({
          stringFilter: { like: 'ab%' },
          value: 'test',
        }),
      ).toBe(false);
    });

    it('treats underscore as a single character wildcard like SQL LIKE', () => {
      expect(
        isMatchingStringFilter({
          stringFilter: { like: 'a_c' },
          value: 'abc',
        }),
      ).toBe(true);
    });

    it('does not match like pattern spanning several characters for underscore', () => {
      expect(
        isMatchingStringFilter({
          stringFilter: { like: 'a_c' },
          value: 'abxc',
        }),
      ).toBe(false);
    });

    it('matches a newline with underscore like SQL LIKE', () => {
      expect(
        isMatchingStringFilter({
          stringFilter: { like: 'a_c' },
          value: 'a\nc',
        }),
      ).toBe(true);
    });

    it('matches an astral character with underscore like SQL LIKE', () => {
      expect(
        isMatchingStringFilter({
          stringFilter: { like: 'a_c' },
          value: 'a\u{1F600}c',
        }),
      ).toBe(true);
    });

    it('matches a newline with percent like SQL LIKE', () => {
      expect(
        isMatchingStringFilter({
          stringFilter: { like: 'a%c' },
          value: 'a\nc',
        }),
      ).toBe(true);
    });

    it('matches an astral character with percent like SQL LIKE', () => {
      expect(
        isMatchingStringFilter({
          stringFilter: { like: 'a%c' },
          value: 'a\u{1F600}c',
        }),
      ).toBe(true);
    });
  });

  describe('ilike', () => {
    it('value matches ilike pattern case insensitively', () => {
      expect(
        isMatchingStringFilter({
          stringFilter: { ilike: 'TE%' },
          value: 'test',
        }),
      ).toBe(true);
    });

    it('value does not match ilike pattern', () => {
      expect(
        isMatchingStringFilter({
          stringFilter: { ilike: 'AB%' },
          value: 'test',
        }),
      ).toBe(false);
    });

    it('treats underscore as a single character wildcard like SQL ILIKE', () => {
      expect(
        isMatchingStringFilter({
          stringFilter: { ilike: 'A_C' },
          value: 'abC',
        }),
      ).toBe(true);
    });

    it('matches a newline with underscore like SQL ILIKE', () => {
      expect(
        isMatchingStringFilter({
          stringFilter: { ilike: 'a_c' },
          value: 'a\nc',
        }),
      ).toBe(true);
    });

    it('matches an astral character with underscore like SQL ILIKE', () => {
      expect(
        isMatchingStringFilter({
          stringFilter: { ilike: 'a_c' },
          value: 'a\u{1F600}c',
        }),
      ).toBe(true);
    });

    it('matches a newline with percent like SQL ILIKE', () => {
      expect(
        isMatchingStringFilter({
          stringFilter: { ilike: 'a%c' },
          value: 'a\nc',
        }),
      ).toBe(true);
    });

    it('matches an astral character with percent like SQL ILIKE', () => {
      expect(
        isMatchingStringFilter({
          stringFilter: { ilike: 'a%c' },
          value: 'a\u{1F600}c',
        }),
      ).toBe(true);
    });
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

describe('escaped wildcards', () => {
  it('keeps an escaped percent literal like SQL LIKE', () => {
    // SQL pattern 50\% matches the literal string 50 percent
    expect(
      isMatchingStringFilter({
        stringFilter: { like: '50\\%' },
        value: '50%',
      }),
    ).toBe(true);
  });

  it('keeps an escaped underscore literal like SQL LIKE', () => {
    // SQL pattern a\_c matches the literal string a_c
    expect(
      isMatchingStringFilter({
        stringFilter: { like: 'a\\_c' },
        value: 'a_c',
      }),
    ).toBe(true);
  });

  it('does not treat an escaped underscore as a wildcard', () => {
    expect(
      isMatchingStringFilter({
        stringFilter: { like: 'a\\_c' },
        value: 'axc',
      }),
    ).toBe(false);
  });

  it('keeps an escaped percent literal like SQL ILIKE', () => {
    expect(
      isMatchingStringFilter({
        stringFilter: { ilike: '50\\%' },
        value: '50%',
      }),
    ).toBe(true);
  });

  it('escapes a non wildcard char after a backslash like SQL LIKE', () => {
    // postgres LIKE treats a backslash before any char as escaping that char
    expect(
      isMatchingStringFilter({
        stringFilter: { like: 'a\\bc' },
        value: 'abc',
      }),
    ).toBe(true);
  });

  it('keeps a trailing lone backslash literal', () => {
    // postgres errors on this pattern, the mirror stays lenient
    expect(
      isMatchingStringFilter({
        stringFilter: { like: 'a\\' },
        value: 'a\\',
      }),
    ).toBe(true);
  });

  it('combines an escaped underscore with a wildcard', () => {
    // SQL pattern a\_% matches strings starting with a_ and ending anywhere
    expect(
      isMatchingStringFilter({
        stringFilter: { like: 'a\\_%' },
        value: 'a_b\nc',
      }),
    ).toBe(true);
  });
});
