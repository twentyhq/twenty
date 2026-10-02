import { isDefined } from './isDefined';

const LATIN_DIACRITICS = /(\p{Script=Latin})\p{Mark}+/gu;
const SPECIAL_LATIN_LETTERS = /[øæßðþłœđıŋ]/g;
const SEARCH_REPLACEMENTS: Record<string, string> = {
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
};

export const normalizeSearchText = (
  text: string | null | undefined,
): string => {
  if (!isDefined(text)) {
    return '';
  }

  return text
    .normalize('NFD')
    .replace(LATIN_DIACRITICS, '$1')
    .normalize('NFC')
    .toLowerCase()
    .replace(
      SPECIAL_LATIN_LETTERS,
      (letter) => SEARCH_REPLACEMENTS[letter] ?? letter,
    );
};
