import { type NormalizationRule } from '../types/normalization-rule.type';

// Backticks in the docs carry two different things: symbols the machine
// resolves, and UI labels the reader sees translated in their own app. Only the
// first kind is restored - a span shaped like an identifier, never one shaped
// like prose - so `useEffect` and `SELECT` are put back while `Settings` and
// `Data Model` stay in the reader's language.
const INLINE_CODE_REGEX = /`[^`\n]+`/g;

function codeSpansIn(text: string): string[] {
  return [...text.matchAll(new RegExp(INLINE_CODE_REGEX))].map(
    ([match]) => match,
  );
}

function looksLikeIdentifier(span: string): boolean {
  const code = span.slice(1, -1);

  if (/\s/.test(code)) return false;

  return (
    /[a-z][A-Z]/.test(code) || /[_./(]/.test(code) || /^[A-Z0-9_]+$/.test(code)
  );
}

// Restores the source's identifiers into the translation position by position.
// Counts that differ mean the two cannot be lined up, so the translation is
// left alone rather than guessed at.
function restoreIdentifiers(text: string, sourceText?: string): string {
  if (sourceText === undefined) return text;

  const sourceSpans = codeSpansIn(sourceText);

  if (
    sourceSpans.length === 0 ||
    sourceSpans.length !== codeSpansIn(text).length
  ) {
    return text;
  }

  let index = 0;

  return text.replace(new RegExp(INLINE_CODE_REGEX), (match) => {
    const sourceSpan = sourceSpans[index++];

    return looksLikeIdentifier(sourceSpan) ? sourceSpan : match;
  });
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
