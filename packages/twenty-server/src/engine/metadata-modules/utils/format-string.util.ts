import { transliterate, slugify } from 'transliteration';
import toCamelCase from 'lodash.camelcase';

import { ChararactersNotSupportedException } from 'src/engine/metadata-modules/errors/CharactersNotSupportedException';

export const validPattern = /^[a-zA-Z][a-zA-Z0-9 ]*$/;

export const formatString = (string: string): string => {
  let formattedString = string;

  if (formattedString.match(validPattern)) {
    return formattedString;
  }

  if (formattedString.match(validPattern)) {
    return toCamelCase(formattedString);
  }

  formattedString = toCamelCase(
    slugify(transliterate(formattedString, { trim: true })),
  );

  if (!formattedString.match(validPattern)) {
    throw new ChararactersNotSupportedException(string);
  }

  return formattedString;
};
