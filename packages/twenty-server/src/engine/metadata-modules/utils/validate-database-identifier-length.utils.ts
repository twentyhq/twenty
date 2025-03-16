import { IDENTIFIER_MAX_CHAR_LENGTH } from 'src/engine/metadata-modules/utils/constants/identifier-max-char-length.constants';
import { IDENTIFIER_MIN_CHAR_LENGTH } from 'src/engine/metadata-modules/utils/constants/identifier-min-char-length.constants';

export const exceedsDatabaseIdentifierMaximumLength = (string: string) =>
  string.length > IDENTIFIER_MAX_CHAR_LENGTH;

export const beneathDatabaseIdentifierMinimumLength = (string: string) =>
  string.length < IDENTIFIER_MIN_CHAR_LENGTH;
