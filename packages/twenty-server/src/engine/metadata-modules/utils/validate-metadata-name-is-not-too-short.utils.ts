import { t } from '@lingui/core/macro';

import {
  InvalidMetadataException,
  InvalidMetadataExceptionCode,
} from 'src/engine/metadata-modules/utils/exceptions/invalid-metadata.exception';
import { beneathDatabaseIdentifierMinimumLength } from 'src/engine/metadata-modules/utils/validate-database-identifier-length.utils';

export const validateMetadataNameIsNotTooShortOrThrow = (name: string) => {
  if (beneathDatabaseIdentifierMinimumLength(name)) {
    throw new InvalidMetadataException(
      t`Input is too short: "${name}"`,
      InvalidMetadataExceptionCode.INPUT_TOO_SHORT,
    );
  }
};
