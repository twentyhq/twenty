import { InvalidStringException } from 'src/engine/metadata-modules/utils/exceptions/invalid-string.exception';
import { NameTooLongException } from 'src/engine/metadata-modules/utils/exceptions/name-too-long.exception';
import { exceedsDatabaseIdentifierMaximumLength } from 'src/engine/metadata-modules/utils/validate-database-identifier-length.utils';

const ONLY_CAPS_AND_LOWER_LETTERS_AND_NUMBER_STRING_REGEX =
  /^[a-z][a-zA-Z0-9]*$/;

export const validateMetadataNameValidityOrThrow = (name: string) => {
  if (!name.match(ONLY_CAPS_AND_LOWER_LETTERS_AND_NUMBER_STRING_REGEX)) {
    throw new InvalidStringException(name);
  }
  if (exceedsDatabaseIdentifierMaximumLength(name)) {
    throw new NameTooLongException(name);
  }
};
