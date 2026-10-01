import { type NormalizationRule } from '../types/normalization-rule.type';

// \w is ASCII-only even under the u flag, and this rule targets Arabic, Japanese and Hebrew.
const ESCAPED_CHARACTER_REGEX = /\\([\p{L}\p{N}])/gu;

// The corruption escapes every character (`\ا\ل\إ` scores 1), a Windows path only a few (about 0.2).
const MINIMUM_ESCAPED_SHARE = 0.8;
const MINIMUM_ESCAPED_CHARACTERS = 3;

function escapedCharacterCount(text: string): number {
  return [...text.matchAll(ESCAPED_CHARACTER_REGEX)].length;
}

function unescapedCharacterCount(text: string): number {
  return [...text.replaceAll('\\', '')].length;
}

// An import once escaped every letter of the Arabic and Japanese UI; wordless-translation misses it as the letters remain.
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
