import { type NormalizationRule } from '../types/normalization-rule.type';

// \w is ASCII-only in JavaScript even under the u flag, and every message this
// rule exists for is Arabic, Japanese or Hebrew.
const ESCAPED_CHARACTER_REGEX = /\\([\p{L}\p{N}])/gu;

// Enough of the message to rule out a Windows path or a regex, where a handful
// of backslashes sit among ordinary text. The corruption escapes every
// character it touches, so the ratio separates the two cleanly: `\ا\ل\إ` scores
// 1, `C:\Users\name\file` scores 0.2.
const MINIMUM_ESCAPED_SHARE = 0.8;
const MINIMUM_ESCAPED_CHARACTERS = 3;

function escapedCharacterCount(text: string): number {
  return [...text.matchAll(ESCAPED_CHARACTER_REGEX)].length;
}

function unescapedCharacterCount(text: string): number {
  return [...text.replaceAll('\\', '')].length;
}

// An import once wrote the Arabic and Japanese UI with a backslash before every
// letter - `\ا\ل\إ\ع\د\ا\د\ا\ت` for Settings, `\ダ\ー\ク` for Dark - which ships
// to the reader verbatim. The letters are intact, so wordless-translation sees
// a real translation and leaves it alone.
function hasEscapedEveryCharacter(text: string): boolean {
  const escaped = escapedCharacterCount(text);
  const unescaped = unescapedCharacterCount(text);

  if (escaped < MINIMUM_ESCAPED_CHARACTERS || unescaped === 0) return false;

  return escaped / unescaped >= MINIMUM_ESCAPED_SHARE;
}

function unescapeEveryCharacter(text: string): string {
  if (!hasEscapedEveryCharacter(text)) return text;

  return text.replace(ESCAPED_CHARACTER_REGEX, '$1');
}

export const ESCAPED_EVERY_CHARACTER_RULE: NormalizationRule = {
  name: 'escaped-every-character',
  formats: ['po', 'mdx'],
  detect: hasEscapedEveryCharacter,
  fix: unescapeEveryCharacter,
};
