/**
 * Rules describing the mechanical corruptions that the translation step (MT / AI
 * / human) introduces in Crowdin, and how to repair each one.
 *
 * Every rule is pure text in / text out and must be idempotent: the normalizer
 * re-runs on every pull, so `fix(fix(text))` has to equal `fix(text)`.
 */

export type NormalizationRule = {
  name: string;
  detect: (text: string) => boolean;
  fix: (text: string) => string;
  sourceFilter?: (sourceText: string) => boolean;
};

const INLINE_CODE_SPAN_REGEX = /`[^`\n]+`/g;
const ESCAPED_TAG_REGEX = /&lt;|&gt;|&#0*60;|&#0*62;|&#x0*3c;|&#x0*3e;/i;
const ESCAPED_UNICODE_REGEX = /\\u[0-9a-fA-F]{4}/;

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

// Scoped to inline-code spans on purpose: an angle bracket escaped anywhere else
// is how MDX carries a literal `<` in prose, and unescaping it would turn
// documentation content into markup and break the very build we are protecting.
function unescapeTagsInInlineCode(text: string): string {
  return text.replace(INLINE_CODE_SPAN_REGEX, (span) =>
    span
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&#0*60;|&#x0*3c;/gi, '<')
      .replace(/&#0*62;|&#x0*3e;/gi, '>'),
  );
}

function unescapeUnicode(text: string): string {
  return text.replace(/\\u([0-9a-fA-F]{4})/g, (match, hex) =>
    String.fromCharCode(parseInt(hex, 16)),
  );
}

export const NORMALIZATION_RULES: NormalizationRule[] = [
  {
    name: 'escaped-unicode',
    detect: (text) => ESCAPED_UNICODE_REGEX.test(text),
    fix: unescapeUnicode,
  },
  {
    name: 'escaped-inline-code-tags',
    detect: hasEscapedTagInInlineCode,
    fix: unescapeTagsInInlineCode,
    sourceFilter: sourceHasTagInInlineCode,
  },
];

export function evaluateRules({
  rules,
  sourceText,
  translationText,
}: {
  rules: NormalizationRule[];
  sourceText: string | undefined;
  translationText: string;
}): { fixedText: string; ruleNames: string[] } {
  return rules.reduce<{ fixedText: string; ruleNames: string[] }>(
    (accumulator, rule) => {
      const isFilteredOut =
        rule.sourceFilter !== undefined &&
        (sourceText === undefined || !rule.sourceFilter(sourceText));

      if (isFilteredOut || !rule.detect(accumulator.fixedText)) {
        return accumulator;
      }

      return {
        fixedText: rule.fix(accumulator.fixedText),
        ruleNames: [...accumulator.ruleNames, rule.name],
      };
    },
    { fixedText: translationText, ruleNames: [] },
  );
}
