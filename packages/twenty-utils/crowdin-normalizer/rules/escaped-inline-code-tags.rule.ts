import { type NormalizationRule } from '../types/normalization-rule.type';

const INLINE_CODE_SPAN_REGEX = /`[^`\n]+`/g;
const ESCAPED_TAG_REGEX = /&lt;|&gt;|&#0*60;|&#0*62;|&#x0*3c;|&#x0*3e;/i;

function inlineCodeSpans(text: string): string[] {
  return text.match(INLINE_CODE_SPAN_REGEX) ?? [];
}

function sourceHasTagInInlineCode(sourceText: string): boolean {
  return inlineCodeSpans(sourceText).some(
    (span) => span.includes('<') || span.includes('>'),
  );
}

function hasEscapedTagInInlineCode(text: string): boolean {
  return inlineCodeSpans(text).some((span) => ESCAPED_TAG_REGEX.test(span));
}

function unescapeTagsInInlineCode(text: string): string {
  return text.replace(INLINE_CODE_SPAN_REGEX, (span) =>
    span
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&#0*60;|&#x0*3c;/gi, '<')
      .replace(/&#0*62;|&#x0*3e;/gi, '>'),
  );
}

export const ESCAPED_INLINE_CODE_TAGS_RULE: NormalizationRule = {
  name: 'escaped-inline-code-tags',
  detect: hasEscapedTagInInlineCode,
  fix: unescapeTagsInInlineCode,
  sourceFilter: sourceHasTagInInlineCode,
};
