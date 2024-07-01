const VALID_STRING_PATTERN = /^[a-z][a-zA-Z0-9]*$/;

export const validateMetadataName = (string: string) => {
  if (!string.match(VALID_STRING_PATTERN)) {
    throw new InvalidStringException(string);
  }
};

export class InvalidStringException extends Error {
  constructor(string: string) {
    const message = `String "${string}" is not valid`;

    super(message);
  }
}
