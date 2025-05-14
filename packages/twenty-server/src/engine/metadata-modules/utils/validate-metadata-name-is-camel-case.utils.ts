import camelCase from 'lodash.camelcase';

import {
  InvalidMetadataException,
  InvalidMetadataExceptionCode,
} from 'src/engine/metadata-modules/utils/exceptions/invalid-metadata.exception';

export const validateMetadataNameIsCamelCaseOrThrow = (name: string) => {
  if (name !== camelCase(name)) {
    throw new InvalidMetadataException(
      `Name should be in camelCase: ${name}`,
      InvalidMetadataExceptionCode.NOT_CAMEL_CASE,
    );
  }
};
