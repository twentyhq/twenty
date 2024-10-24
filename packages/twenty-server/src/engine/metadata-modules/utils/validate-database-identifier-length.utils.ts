import { IDENTIFIER_MAX_CHAR_LENGTH } from 'src/engine/metadata-modules/utils/constants/identifier-max-char-length.constants';

export const exceedsDatabaseIdentifierMaximumLength = (string: string) => {
  return string.length > IDENTIFIER_MAX_CHAR_LENGTH;
};
