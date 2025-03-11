import camelCase from 'lodash.camelcase';

import { InvalidMetadataNameException } from 'src/engine/metadata-modules/utils/exceptions/invalid-metadata-name.exception';

export const validateMetadataNameIsCamelCaseOrThrow = (name: string) => {
  if (name !== camelCase(name)) {
    throw new InvalidMetadataNameException(
      `Name should be in camelCase: ${name}`,
    );
  }
};
