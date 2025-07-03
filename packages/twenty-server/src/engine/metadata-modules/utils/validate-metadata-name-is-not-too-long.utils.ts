import { t } from '@lingui/core/macro';

import {
  InvalidMetadataException,
  InvalidMetadataExceptionCode,
} from 'src/engine/metadata-modules/utils/exceptions/invalid-metadata.exception';
import { exceedsDatabaseIdentifierMaximumLength } from 'src/engine/metadata-modules/utils/validate-database-identifier-length.utils';

export const validateMetadataNameIsNotTooLongOrThrow = (name: string) => {
  if (exceedsDatabaseIdentifierMaximumLength(name)) {
    throw new InvalidMetadataException(
      t`Name is too long: it exceeds the 63 characters limit.`,
      InvalidMetadataExceptionCode.EXCEEDS_MAX_LENGTH,
    );
  }
};
