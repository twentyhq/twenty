import { transliterate, slugify } from 'transliteration';
import toCamelCase from 'lodash.camelcase';

import { ChararactersNotSupportedException } from 'src/engine/metadata-modules/errors/CharactersNotSupportedException';

export const validPattern = /^[a-zA-Z][a-zA-Z0-9 ]*$/;
const startsWithDigitPattern = /^[^\d]*(\d+)/;

export const formatString = (string: string): string => {
  let formattedString = string;

  if (formattedString.match(validPattern)) {
    return formattedString;
  }

  if (formattedString.match(startsWithDigitPattern)) {
    const digitsAtStart = formattedString.match(startsWithDigitPattern)?.[0];

    formattedString =
      formattedString.slice(digitsAtStart?.length || 0) + digitsAtStart;
  }

  if (formattedString.match(validPattern)) {
    return toCamelCase(formattedString);
  }

  formattedString = toCamelCase(
    slugify(transliterate(formattedString, { trim: true }) + '-transliterated'),
  );

  if (!formattedString.match(validPattern)) {
    throw new ChararactersNotSupportedException(string);
  }

  return formattedString;
};
