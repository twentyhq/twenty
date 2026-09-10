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

    it('should handle SQL single-character wildcard (_)', () => {
      expect(
        isMatchingRichTextFilter({
          richTextFilter: { markdown: { ilike: 'h_llo' } },
          value: 'hello',
        }),
      ).toBe(true);

      expect(
        isMatchingRichTextFilter({
          richTextFilter: { markdown: { ilike: 'h_llo' } },
          value: 'hllo',
        }),
      ).toBe(false);

      expect(
        isMatchingRichTextFilter({
          richTextFilter: { markdown: { ilike: '%h_llo%' } },
          value: 'prefix hillo suffix',
        }),
      ).toBe(true);
    });

    it('should match across newlines in multiline markdown', () => {
      expect(
        isMatchingRichTextFilter({
          richTextFilter: { markdown: { ilike: '%first%second%' } },
          value: '# Title\nfirst paragraph\nsome text\nsecond paragraph',
        }),
      ).toBe(true);
    });

    it('should escape regex special characters while preserving SQL wildcards', () => {
      expect(
        isMatchingRichTextFilter({
          richTextFilter: { markdown: { ilike: '%price: $10.00 (tax incl.)%' } },
          value: 'Total price: $10.00 (tax incl.) for the item',
        }),
      ).toBe(true);

      expect(
        isMatchingRichTextFilter({
          richTextFilter: { markdown: { ilike: '%price: $10_00%' } },
          value: 'Total price: $10.00 for the item',
        }),
      ).toBe(true);
    });

    it('should support object value with markdown property', () => {
      expect(
        isMatchingRichTextFilter({
          richTextFilter: { markdown: { ilike: '%note%' } },
          value: { markdown: 'This is a note', blocknote: '{"root":{}}' },
        }),
      ).toBe(true);
    });
  });

  describe('blocknote ilike', () => {
    it('should match blocknote content with wildcards', () => {
      expect(
        isMatchingRichTextFilter({
          richTextFilter: { blocknote: { ilike: '%content%' } },
          value: { blocknote: 'rich text content here', markdown: 'other' },
        }),
      ).toBe(true);
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
