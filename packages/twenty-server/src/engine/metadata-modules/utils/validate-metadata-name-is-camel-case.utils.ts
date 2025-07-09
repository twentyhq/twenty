import { t } from '@lingui/core/macro';
import camelCase from 'lodash.camelcase';

import {
  InvalidMetadataException,
  InvalidMetadataExceptionCode,
} from 'src/engine/metadata-modules/utils/exceptions/invalid-metadata.exception';

export const validateMetadataNameIsCamelCaseOrThrow = (name: string) => {
  if (name !== camelCase(name)) {
    throw new InvalidMetadataException(
      t`${name} should be in camelCase`,
      InvalidMetadataExceptionCode.NOT_CAMEL_CASE,
    );
  }
};
