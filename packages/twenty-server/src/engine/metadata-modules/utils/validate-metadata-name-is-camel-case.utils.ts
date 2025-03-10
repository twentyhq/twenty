import camelCase from 'lodash.camelcase';

import { NameIsNotInCamelCase } from 'src/engine/metadata-modules/utils/exceptions/name-not-camel-case.exception';

export const validateMetadataNameIsCamelCaseOrThrow = (name: string) => {
  if (name !== camelCase(name)) {
    throw new NameIsNotInCamelCase(name);
  }
};
