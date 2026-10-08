import { type NormalizationRule } from '../types/normalization-rule.type';

// Only identifier-shaped spans are restored; prose-shaped ones are UI labels the reader sees translated.
const INLINE_CODE_REGEX = /`[^`\n]+`/g;

function codeSpansIn(text: string): string[] {
  return [...text.matchAll(new RegExp(INLINE_CODE_REGEX))].map(
    ([match]) => match,
  );
}

// Translators broke hyphenated names (`vingt-emails` for `twenty-emails`); no English prose takes that shape.
const KEBAB_CASE_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)+$/;

function looksLikeIdentifier(span: string): boolean {
  const code = span.slice(1, -1);

  if (/\s/.test(code)) return false;

  return (
    /[a-z][A-Z]/.test(code) ||
    /[_./(]/.test(code) ||
    /^[A-Z0-9_]+$/.test(code) ||
    KEBAB_CASE_REGEX.test(code)
  );
}

// Only single-span messages: translations reorder spans, so restoring by position overwrites the wrong one.
function restoreIdentifiers(text: string, sourceText?: string): string {
  if (sourceText === undefined) return text;

  const sourceSpans = codeSpansIn(sourceText);
  const targetSpans = codeSpansIn(text);

  if (
    sourceSpans.length !== 1 ||
    targetSpans.length !== 1 ||
    !looksLikeIdentifier(sourceSpans[0])
  ) {
    return text;
  }

  return text.replace(INLINE_CODE_REGEX, sourceSpans[0]);
}

function hasTranslatedIdentifier(text: string, sourceText?: string): boolean {
  if (sourceText === undefined) return false;

  return restoreIdentifiers(text, sourceText) !== text;
}

export const TRANSLATED_IDENTIFIER_RULE: NormalizationRule = {
  name: 'translated-identifier',
  formats: ['mdx'],
  needsSourceText: true,
  detect: hasTranslatedIdentifier,
  fix: restoreIdentifiers,
};
