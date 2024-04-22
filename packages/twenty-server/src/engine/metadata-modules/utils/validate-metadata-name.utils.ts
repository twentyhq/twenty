import { InvalidStringException } from 'src/engine/metadata-modules/errors/InvalidStringException';

const VALID_STRING_PATTERN = /^[a-zA-Z][a-zA-Z0-9 ]*$/;

export const validateMetadataName = (string: string) => {
  if (!string.match(VALID_STRING_PATTERN)) {
    throw new InvalidStringException(string);
  }
};
