import { type NormalizationRule } from '../types/normalization-rule.type';

const ESCAPED_UNICODE_REGEX = /\\u([0-9a-fA-F]{4})/g;

function escapesIn(text: string): string[] {
  return [...text.matchAll(ESCAPED_UNICODE_REGEX)].map(([escape]) => escape);
}

// A source that writes the escape itself - a code sample, a string about
// escaping - means the translation is right to carry it through. Only an escape
// the translator introduced is a decoding failure, and without the source there
// is no way to tell the two apart, so the rule stands down as its peers do.
function hasEscapedUnicode(text: string, sourceText?: string): boolean {
  if (sourceText === undefined) return false;

  return escapesIn(text).some((escape) => !sourceText.includes(escape));
}

function unescapeUnicode(text: string, sourceText?: string): string {
  if (sourceText === undefined) return text;

  return text.replace(ESCAPED_UNICODE_REGEX, (escape, hex) =>
    sourceText.includes(escape)
      ? escape
      : String.fromCharCode(parseInt(hex, 16)),
  );
}

export const ESCAPED_UNICODE_RULE: NormalizationRule = {
  name: 'escaped-unicode',
  formats: ['po'],
  needsSourceText: true,
  detect: hasEscapedUnicode,
  fix: unescapeUnicode,
};
