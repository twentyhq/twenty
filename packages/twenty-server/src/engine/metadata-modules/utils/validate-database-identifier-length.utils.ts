import { IDENTIFIER_MAX_CHAR_LENGTH } from 'src/engine/metadata-modules/utils/metadata.constants';

export const exceedsDatabaseIdentifierMaximumLength = (
  string: string,
  prefixLength = 0,
) => {
  return string.length > IDENTIFIER_MAX_CHAR_LENGTH - prefixLength;
};
