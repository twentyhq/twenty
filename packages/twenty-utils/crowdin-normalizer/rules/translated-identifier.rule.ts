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

// Package, command and header names are hyphenated lowercase, and that is the
// shape translators actually broke: the French docs ship `vingt-emails` and the
// Japanese `20-emails` for `twenty-emails`, each inside an npx command nobody
// can run. Nothing in the English source has this shape without being a symbol.
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

// Only a message carrying exactly one span on each side is repaired. Lining
// spans up by position looked obvious and is wrong: a translation reorders them
// to suit its own grammar, so "the `twenty-app` keyword in your `package.json`
// `keywords` array" comes back with keywords and package.json swapped, and
// restoring by position writes package.json over both. With one span there is
// no order to get wrong.
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
