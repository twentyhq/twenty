import camelCase from 'lodash.camelcase';
import { slugify } from 'transliteration';

import { sanitizeReservedKeyword } from './sanitize-reserved-keyword.util';

export const computeMetadataNameFromLabel = (label: string): string => {
  if (!label) return '';

  const prefixedLabel = /^\d/.test(label) ? `n${label}` : label;

  if (prefixedLabel === '') return '';

  const formattedString = slugify(prefixedLabel, {
    trim: true,
    separator: '_',
    allowedChars: 'a-zA-Z0-9',
  });

  if (formattedString === '') {
    throw new Error(`Invalid label: "${label}"`);
  }

  const computedName = camelCase(formattedString);

  return sanitizeReservedKeyword(computedName);
};
