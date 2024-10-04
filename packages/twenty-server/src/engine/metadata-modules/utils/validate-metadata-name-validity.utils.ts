import { InvalidStringException } from 'src/engine/metadata-modules/utils/exceptions/invalid-string.exception';
import { NameTooLongException } from 'src/engine/metadata-modules/utils/exceptions/name-too-long.exception';
import { exceedsDatabaseIdentifierMaximumLength } from 'src/engine/metadata-modules/utils/validate-database-identifier-length.utils';

const VALID_STRING_PATTERN = /^[a-z][a-zA-Z0-9]*$/;

export const validateMetadataNameValidityOrThrow = (name: string) => {
  if (!name.match(VALID_STRING_PATTERN)) {
    throw new InvalidStringException(name);
  }
  if (exceedsDatabaseIdentifierMaximumLength(name)) {
    throw new NameTooLongException(name);
  }
};
