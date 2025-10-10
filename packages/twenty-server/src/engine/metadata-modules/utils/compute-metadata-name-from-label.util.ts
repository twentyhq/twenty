import { msg } from '@lingui/core/macro';
import camelCase from 'lodash.camelcase';
import { slugify } from 'transliteration';
import { isDefined } from 'twenty-shared/utils';

import {
  InvalidMetadataException,
  InvalidMetadataExceptionCode,
} from 'src/engine/metadata-modules/utils/exceptions/invalid-metadata.exception';

export const computeMetadataNameFromLabel = (label: string): string => {
  if (!isDefined(label)) {
    throw new InvalidMetadataException(
      'Label is required',
      InvalidMetadataExceptionCode.LABEL_REQUIRED,
      {
        userFriendlyMessage: msg`Label is required`,
      },
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
      {
        userFriendlyMessage: msg`Invalid label: "${label}"`,
      },
    );
  }

  return camelCase(formattedString);
};
