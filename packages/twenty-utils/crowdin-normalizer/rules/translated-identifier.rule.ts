import { type NormalizationRule } from '../types/normalization-rule.type';

// A path the browser resolves, not prose. The docs catalog holds whole strings
// that are nothing but a route, and a translated one is a dead link.
const WHOLE_PATH_REGEX = /^\/[A-Za-z0-9\-_/.#]*$/;

// Backticks in the docs carry two different things: symbols the machine
// resolves, and UI labels the reader sees translated in their own app. Only the
// first kind is restored - a span shaped like an identifier, never one shaped
// like prose, so `useEffect` and `SELECT` are put back while `Settings` and
// `Data Model` stay in the reader's language.
const INLINE_CODE_REGEX = /`[^`\n]+`/g;
const LINK_TARGET_REGEX = /\]\(([^)\s]+)(\)|\s)/g;

function matchesOf(text: string, pattern: RegExp): string[] {
  return [...text.matchAll(new RegExp(pattern))].map(([match]) => match);
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
function restore(text: string, sourceText: string, pattern: RegExp): string {
  const sourceMatches = matchesOf(sourceText, pattern);
  const targetMatches = matchesOf(text, pattern);

  if (
    sourceMatches.length === 0 ||
    sourceMatches.length !== targetMatches.length
  ) {
    return text;
  }

  let index = 0;

  return text.replace(new RegExp(pattern), (match) => {
    const replacement = sourceMatches[index++];

    // A span the source writes as prose is a UI label, and the reader sees it
    // translated in their own app, so the translation keeps it.
    if (pattern === INLINE_CODE_REGEX && !looksLikeIdentifier(replacement)) {
      return match;
    }

    return replacement;
  });
}

function restoreIdentifiers(text: string, sourceText?: string): string {
  if (sourceText === undefined) return text;

  if (WHOLE_PATH_REGEX.test(sourceText)) return sourceText;

  return restore(
    restore(text, sourceText, INLINE_CODE_REGEX),
    sourceText,
    LINK_TARGET_REGEX,
  );
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
