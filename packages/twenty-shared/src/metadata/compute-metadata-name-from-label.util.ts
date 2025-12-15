import { addCustomSuffixIfIsReserved } from '@/metadata/add-custom-suffix-if-reserved.util';
import camelCase from 'lodash.camelcase';
import { slugify } from 'transliteration';

export const computeMetadataNameFromLabel = ({
  label,
  applyCustomSuffix = true,
}: {
  label: string;
  applyCustomSuffix?: boolean;
}): string => {
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

  return applyCustomSuffix
    ? addCustomSuffixIfIsReserved(computedName)
    : computedName;
};
