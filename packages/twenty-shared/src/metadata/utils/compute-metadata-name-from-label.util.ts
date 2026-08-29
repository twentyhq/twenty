import { addCustomSuffixIfIsReserved } from '@/metadata/utils/add-custom-suffix-if-reserved.util';
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

  const slugifiedLabel = slugify(label, {
    trim: true,
    separator: '_',
    allowedChars: 'a-zA-Z0-9',
  });

  if (slugifiedLabel === '') {
    throw new Error(`Invalid label: "${label}"`);
  }

  // Prefix the digit guard AFTER slugify: slugify strips leading
  // non-alphanumerics, so a label like " 5 things" or "$5 fee" is not
  // digit-leading itself but slugifies to "5_things"/"5_fee". Checking the raw
  // label let those through and produced an invalid digit-leading name.
  const formattedString = /^\d/.test(slugifiedLabel)
    ? `n_${slugifiedLabel}`
    : slugifiedLabel;

  const computedName = camelCase(formattedString);

  return applyCustomSuffix
    ? addCustomSuffixIfIsReserved(computedName)
    : computedName;
};
