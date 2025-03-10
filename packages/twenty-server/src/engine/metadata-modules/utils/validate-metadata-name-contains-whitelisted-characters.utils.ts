import { InvalidStringException } from 'src/engine/metadata-modules/utils/exceptions/invalid-string.exception';

const ONLY_CAPS_AND_LOWER_LETTERS_AND_NUMBER_STRING_REGEX =
  /^[a-z][a-zA-Z0-9]*$/;

export const validateMetadataNameOnlyContainsWhitelistedCharactersOrThrow = (
  name: string,
) => {
  if (!name.match(ONLY_CAPS_AND_LOWER_LETTERS_AND_NUMBER_STRING_REGEX)) {
    throw new InvalidStringException(name);
  }
};
