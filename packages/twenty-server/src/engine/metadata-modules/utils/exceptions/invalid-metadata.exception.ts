import { CustomException } from 'src/utils/custom-exception';

export class InvalidMetadataException extends CustomException {
  constructor(
    message: string,
    code: InvalidMetadataExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: string } = {},
  ) {
    super(message, code, userFriendlyMessage);
  }
}

export enum InvalidMetadataExceptionCode {
  LABEL_REQUIRED = 'Label required',
  INPUT_TOO_SHORT = 'Input too short',
  EXCEEDS_MAX_LENGTH = 'Exceeds max length',
  RESERVED_KEYWORD = 'Reserved keyword',
  NOT_CAMEL_CASE = 'Not camel case',
  NOT_FIRST_LETTER_UPPER_CASE = 'Not first letter upper case',
  INVALID_LABEL = 'Invalid label',
  NAME_NOT_SYNCED_WITH_LABEL = 'Name not synced with label',
  INVALID_STRING = 'Invalid string',
  NOT_AVAILABLE = 'Name not available',
}
