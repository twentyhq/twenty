import { msg } from '@lingui/core/macro';
import { RESERVED_METADATA_NAME_KEYWORDS } from 'twenty-shared/metadata';

import {
  InvalidMetadataException,
  InvalidMetadataExceptionCode,
} from 'src/engine/metadata-modules/utils/exceptions/invalid-metadata.exception';

export const validateMetadataNameIsNotReservedKeywordOrThrow = (
  name: string,
) => {
  if (RESERVED_METADATA_NAME_KEYWORDS.includes(name)) {
    throw new InvalidMetadataException(
      `The name "${name}" is not available`,
      InvalidMetadataExceptionCode.RESERVED_KEYWORD,
      {
        userFriendlyMessage: msg`This name is not available.`,
      },
    );
  }
};
