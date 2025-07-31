import camelCase from 'lodash.camelcase';
import { slugify } from 'transliteration';
import { isDefined } from 'twenty-shared/utils';

import {
  InvalidMetadataException,
  InvalidMetadataExceptionCode,
} from 'src/engine/metadata-modules/utils/exceptions/invalid-metadata.exception';

export const validateNameAndLabelAreSyncOrThrow = ({
  label,
  name,
}: {
  label: string;
  name: string;
}) => {
  const computedName = computeMetadataNameFromLabel(label);

  if (name !== computedName) {
    throw new InvalidMetadataException(
      `Name is not synced with label. Expected name: "${computedName}", got ${name}`,
      InvalidMetadataExceptionCode.NAME_NOT_SYNCED_WITH_LABEL,
    );
  }
};

export const computeMetadataNameFromLabel = (label: string): string => {
  if (!isDefined(label)) {
    throw new InvalidMetadataException(
      'Label is required',
      InvalidMetadataExceptionCode.LABEL_REQUIRED,
    );
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
    throw new InvalidMetadataException(
      `Invalid label: "${label}"`,
      InvalidMetadataExceptionCode.INVALID_LABEL,
    );
  }

  return camelCase(formattedString);
};
