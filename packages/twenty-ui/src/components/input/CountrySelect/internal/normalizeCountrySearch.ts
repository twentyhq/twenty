const DIACRITICS = /\p{Diacritic}/gu;
const SPECIAL_LETTERS = /[øæßðþłœ]/g;
const SEARCH_REPLACEMENTS: Record<string, string> = {
  ø: 'o',
  æ: 'ae',
  ß: 'ss',
  ð: 'd',
  þ: 'th',
  ł: 'l',
  œ: 'oe',
};

export const normalizeCountrySearch = (value: string) =>
  value
    .normalize('NFD')
    .replace(DIACRITICS, '')
    .toLowerCase()
    .replace(
      SPECIAL_LETTERS,
      (letter) => SEARCH_REPLACEMENTS[letter] ?? letter,
    );
