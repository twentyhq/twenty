import { type NormalizationRule } from '../types/normalization-rule.type';

// \w is ASCII-only in JavaScript, which would read every Chinese, Arabic or
// Hebrew translation as wordless. Only the Unicode letter and number categories
// hold across the scripts we translate into.
const WORD_CHARACTER_REGEX = /[\p{L}\p{N}]/u;

function hasWordCharacter(text: string): boolean {
  return WORD_CHARACTER_REGEX.test(text);
}

// A translation carrying no letter or digit at all cannot be a rendering of a
// source that carries them - it is a stray backslash, an escaped quote pair,
// punctuation debris. A source with no words of its own, such as a lone
// placeholder or a separator, is left alone: there a wordless translation is
// the correct one.
function isWordlessTranslation(text: string, sourceText?: string): boolean {
  // Rules run in sequence on each other's output, so an empty text means an
  // earlier rule already dropped this translation: firing again would only
  // report the same deletion twice.
  if (sourceText === undefined || text === '') return false;

  return hasWordCharacter(sourceText) && !hasWordCharacter(text);
}

// Debris holds nothing to rebuild the missing words from, so the translation is
// dropped and the string falls back to English until Crowdin retranslates it.
function dropTranslation(): string {
  return '';
}

export const WORDLESS_TRANSLATION_RULE: NormalizationRule = {
  name: 'wordless-translation',
  formats: ['po'],
  needsSourceText: true,
  detect: isWordlessTranslation,
  fix: dropTranslation,
};
