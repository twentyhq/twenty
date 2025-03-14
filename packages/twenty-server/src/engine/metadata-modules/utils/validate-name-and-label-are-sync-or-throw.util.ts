import camelCase from 'lodash.camelcase';
import { slugify } from 'transliteration';
import { isDefined } from 'twenty-shared';

import { InvalidMetadataException } from 'src/engine/metadata-modules/utils/exceptions/invalid-metadata.exception';

export const validateNameAndLabelAreSyncOrThrow = (
  label: string,
  name: string,
) => {
  const computedName = computeMetadataNameFromLabel(label);

  if (name !== computedName) {
    throw new InvalidMetadataException(
      `Name is not synced with label. Expected name: "${computedName}", got ${name}`,
    );
  }
};

export const computeMetadataNameFromLabel = (label: string): string => {
  if (!isDefined(label)) {
    throw new InvalidMetadataException('Label is required');
  }

  const prefixedLabel = /^\d/.test(label) ? `n${label}` : label;

  if (prefixedLabel === '') {
    return '';
  }

  const formattedString = slugify(prefixedLabel, {
    trim: true,
    separator: '_',
    allowedChars: 'a-zA-Z0-9',
  });

  if (formattedString === '') {
    throw new InvalidMetadataException(`Invalid label: "${label}"`);
  }

  return camelCase(formattedString);
};
