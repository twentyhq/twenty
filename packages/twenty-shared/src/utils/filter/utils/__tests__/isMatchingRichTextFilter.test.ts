import { isMatchingRichTextFilter } from '@/utils/filter/utils/isMatchingRichTextFilter';

describe('isMatchingRichTextFilter', () => {
  describe('markdown ilike', () => {
    it('should match with wildcard pattern', () => {
      expect(
        isMatchingRichTextFilter({
          richTextFilter: { markdown: { ilike: '%hello%' } },
          value: 'say hello world',
        }),
      ).toBe(true);
    });

    it('should not match when pattern does not match', () => {
      expect(
        isMatchingRichTextFilter({
          richTextFilter: { markdown: { ilike: '%goodbye%' } },
          value: 'say hello world',
        }),
      ).toBe(false);
    });

    it('should be case insensitive', () => {
      expect(
        isMatchingRichTextFilter({
          richTextFilter: { markdown: { ilike: '%HELLO%' } },
          value: 'say hello world',
        }),
      ).toBe(true);
    });

    it('should treat underscore as a single character wildcard like SQL ILIKE', () => {
      expect(
        isMatchingRichTextFilter({
          richTextFilter: { markdown: { ilike: 'a_c' } },
          value: 'abc',
        }),
      ).toBe(true);
    });

    it('should not match several characters for underscore', () => {
      expect(
        isMatchingRichTextFilter({
          richTextFilter: { markdown: { ilike: 'a_c' } },
          value: 'abxc',
        }),
      ).toBe(false);
    });

    it('should match a newline with underscore like SQL ILIKE', () => {
      expect(
        isMatchingRichTextFilter({
          richTextFilter: { markdown: { ilike: 'a_c' } },
          value: 'a\nc',
        }),
      ).toBe(true);
    });

    it('should match a newline with percent like SQL ILIKE', () => {
      expect(
        isMatchingRichTextFilter({
          richTextFilter: { markdown: { ilike: 'a%c' } },
          value: 'a\nc',
        }),
      ).toBe(true);
    });

    it('should match an astral character with underscore like SQL ILIKE', () => {
      expect(
        isMatchingRichTextFilter({
          richTextFilter: { markdown: { ilike: 'a_c' } },
          value: 'a\u{1F600}c',
        }),
      ).toBe(true);
    });

    it('should keep an escaped percent literal like SQL ILIKE', () => {
      expect(
        isMatchingRichTextFilter({
          richTextFilter: { markdown: { ilike: '100\\%' } },
          value: '100%',
        }),
      ).toBe(true);
    });

    it('should not let an escaped percent act as a wildcard', () => {
      expect(
        isMatchingRichTextFilter({
          richTextFilter: { markdown: { ilike: '100\\%' } },
          value: '100a',
        }),
      ).toBe(false);
    });

    it('should keep an escaped underscore literal like SQL ILIKE', () => {
      expect(
        isMatchingRichTextFilter({
          richTextFilter: { markdown: { ilike: 'a\\_c' } },
          value: 'a_c',
        }),
      ).toBe(true);
    });

    it('should not let an escaped underscore act as a wildcard', () => {
      expect(
        isMatchingRichTextFilter({
          richTextFilter: { markdown: { ilike: 'a\\_c' } },
          value: 'abc',
        }),
      ).toBe(false);
    });

    it('should keep an escaped backslash literal like SQL ILIKE', () => {
      expect(
        isMatchingRichTextFilter({
          richTextFilter: { markdown: { ilike: 'a\\\\c' } },
          value: 'a\\c',
        }),
      ).toBe(true);
    });

    it('should keep a trailing escape char literal', () => {
      // postgres rejects a pattern ending with a lone escape char, the mirror
      // stays lenient and treats it as a literal backslash
      expect(
        isMatchingRichTextFilter({
          richTextFilter: { markdown: { ilike: 'abc\\' } },
          value: 'abc\\',
        }),
      ).toBe(true);
    });

    it('should not match when the markdown filter has no ilike', () => {
      // ILIKE NULL is never true in postgres, the old code matched the literal
      // word undefined bcs escapeRegExp coerced its argument
      expect(
        isMatchingRichTextFilter({
          richTextFilter: { markdown: {} },
          value: 'undefined',
        }),
      ).toBe(false);
    });
  });

  describe('default', () => {
    it('should throw for unexpected filter', () => {
      expect(() =>
        isMatchingRichTextFilter({
          richTextFilter: {} as any,
          value: 'test',
        }),
      ).toThrow('Unexpected value for RICH_TEXT filter');
    });
  });
});
