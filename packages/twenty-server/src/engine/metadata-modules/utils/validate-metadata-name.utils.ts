import { exceedsDatabaseIdentifierMaximumLength } from 'src/engine/metadata-modules/utils/validate-database-identifier-length.utils';

const VALID_STRING_PATTERN = /^[a-z][a-zA-Z0-9]*$/;

export const validateMetadataNameOrThrow = (name: string) => {
  if (!name.match(VALID_STRING_PATTERN)) {
    throw new InvalidStringException(name);
  }
  if (exceedsDatabaseIdentifierMaximumLength(name)) {
    throw new NameTooLongException(name);
  }
};

export class InvalidStringException extends Error {
  constructor(string: string) {
    const message = `String "${string}" is not valid`;

    super(message);
  }
}

export class NameTooLongException extends Error {
  constructor(string: string) {
    const message = `String "${string}" exceeds 63 characters limit`;

    super(message);
  }
}
