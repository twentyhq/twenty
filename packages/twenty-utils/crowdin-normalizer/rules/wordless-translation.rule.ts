import { type NormalizationRule } from '../types/normalization-rule.type';

// \w is ASCII-only; only the Unicode letter and number categories hold across our scripts.
const WORD_CHARACTER_REGEX = /[\p{L}\p{N}]/u;

function hasWordCharacter(text: string): boolean {
  return WORD_CHARACTER_REGEX.test(text);
}

// A wordless source (a lone placeholder, a separator) legitimately has a wordless translation.
function isWordlessTranslation(text: string, sourceText?: string): boolean {
  // Rules chain, so empty text means an earlier rule already dropped this translation.
  if (sourceText === undefined || text === '') return false;

  return hasWordCharacter(sourceText) && !hasWordCharacter(text);
}

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
