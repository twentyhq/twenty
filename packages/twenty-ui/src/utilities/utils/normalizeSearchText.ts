import { isDefined } from './isDefined';

const SPACING_DIACRITICS = /[·ʻʼ´¨ˆ˜΄ˇ˘˙˚˛˝¯¸^`]/g;
const MARKS_AFTER_LATIN_GREEK_ARABIC_OR_HEBREW_LETTER =
  /([\p{Script=Latin}\p{Script=Greek}\p{Script_Extensions=Arabic}\p{Script=Hebrew}])\p{Mark}+/gu;
const CYRILLIC_LETTER_WITH_MARKS = /(\p{Script=Cyrillic})(\p{Mark}+)/gu;
const CYRILLIC_STRESS_ACCENTS = /[\u0300\u0301]/g;
const CYRILLIC_LETTERS_FORMED_WITH_ACUTE = ['г', 'к'];
const HANGUL_SYLLABLES = /[가-힣]+/g;
const SEARCH_LETTER_REPLACEMENTS: Record<string, string> = {
  ø: 'o',
  æ: 'ae',
  ß: 'ss',
  ð: 'd',
  þ: 'th',
  ł: 'l',
  œ: 'oe',
  đ: 'd',
  ı: 'i',
  ŋ: 'ng',
  ς: 'σ',
  ё: 'е',
};
const LETTERS_WITH_SEARCH_REPLACEMENT = new RegExp(
  `[${Object.keys(SEARCH_LETTER_REPLACEMENTS).join('')}]`,
  'g',
);

const removeCyrillicStressAccents = (
  _match: string,
  letter: string,
  marks: string,
) =>
  CYRILLIC_LETTERS_FORMED_WITH_ACUTE.includes(letter)
    ? `${letter}${marks}`
    : `${letter}${marks.replace(CYRILLIC_STRESS_ACCENTS, '')}`;

export const normalizeSearchText = (
  text: string | null | undefined,
): string => {
  if (!isDefined(text)) {
    return '';
  }

  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(SPACING_DIACRITICS, '')
    .replace(MARKS_AFTER_LATIN_GREEK_ARABIC_OR_HEBREW_LETTER, '$1')
    .replace(CYRILLIC_LETTER_WITH_MARKS, removeCyrillicStressAccents)
    .normalize('NFC')
    .replace(HANGUL_SYLLABLES, (syllables) => syllables.normalize('NFD'))
    .replace(
      LETTERS_WITH_SEARCH_REPLACEMENT,
      (letter) => SEARCH_LETTER_REPLACEMENTS[letter] ?? letter,
    );
};
