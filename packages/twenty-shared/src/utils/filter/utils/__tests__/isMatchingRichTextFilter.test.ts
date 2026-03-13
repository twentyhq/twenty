import { isMatchingRichTextV2Filter } from '@/utils/filter/utils/isMatchingRichTextV2Filter';

describe('isMatchingRichTextV2Filter', () => {
  describe('markdown ilike', () => {
    it('should match with wildcard pattern', () => {
      expect(
        isMatchingRichTextV2Filter({
          richTextV2Filter: { markdown: { ilike: '%hello%' } },
          value: 'say hello world',
        }),
      ).toBe(true);
    });

    it('should not match when pattern does not match', () => {
      expect(
        isMatchingRichTextV2Filter({
          richTextV2Filter: { markdown: { ilike: '%goodbye%' } },
          value: 'say hello world',
        }),
      ).toBe(false);
    });

    it('should be case insensitive', () => {
      expect(
        isMatchingRichTextV2Filter({
          richTextV2Filter: { markdown: { ilike: '%HELLO%' } },
          value: 'say hello world',
        }),
      ).toBe(true);
    });
  });

  describe('default', () => {
    it('should throw for unexpected filter', () => {
      expect(() =>
        isMatchingRichTextV2Filter({
          richTextV2Filter: {} as any,
          value: 'test',
        }),
      ).toThrow('Unexpected value for RICH_TEXT_V2 filter');
    });
  });
});
