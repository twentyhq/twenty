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
  });

  describe('markdown is', () => {
    it('should match nullability filters', () => {
      expect(
        isMatchingRichTextFilter({
          richTextFilter: { markdown: { is: 'NULL' } },
          value: null,
        }),
      ).toBe(true);

      expect(
        isMatchingRichTextFilter({
          richTextFilter: { markdown: { is: 'NOT_NULL' } },
          value: 'say hello world',
        }),
      ).toBe(true);
    });
  });

  describe('default', () => {
    it('should throw for unexpected filter', () => {
      expect(() =>
        isMatchingRichTextFilter({
          richTextFilter: { blocknote: { ilike: '%test%' } },
          value: 'test',
        }),
      ).toThrow('Unexpected value for RICH_TEXT filter');
    });
  });
});
