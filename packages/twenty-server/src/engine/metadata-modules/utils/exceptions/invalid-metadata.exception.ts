import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

export enum InvalidMetadataExceptionCode {
  LABEL_REQUIRED = 'Label required',
  INPUT_TOO_SHORT = 'Input too short',
  EXCEEDS_MAX_LENGTH = 'Exceeds max length',
  RESERVED_KEYWORD = 'Reserved keyword',
  NOT_CAMEL_CASE = 'Not camel case',
  INVALID_LABEL = 'Invalid label',
  NAME_NOT_SYNCED_WITH_LABEL = 'Name not synced with label',
  INVALID_STRING = 'Invalid string',
  NOT_AVAILABLE = 'Name not available',
}

const invalidMetadataExceptionUserFriendlyMessages: Record<
  InvalidMetadataExceptionCode,
  MessageDescriptor
> = {
  [InvalidMetadataExceptionCode.LABEL_REQUIRED]: msg`Label is required.`,
  [InvalidMetadataExceptionCode.INPUT_TOO_SHORT]: msg`Input is too short.`,
  [InvalidMetadataExceptionCode.EXCEEDS_MAX_LENGTH]: msg`Input exceeds maximum length.`,
  [InvalidMetadataExceptionCode.RESERVED_KEYWORD]: msg`This name is a reserved keyword.`,
  [InvalidMetadataExceptionCode.NOT_CAMEL_CASE]: msg`Name must be in camelCase format.`,
  [InvalidMetadataExceptionCode.INVALID_LABEL]: msg`Invalid label format.`,
  [InvalidMetadataExceptionCode.NAME_NOT_SYNCED_WITH_LABEL]: msg`Name is not synced with label.`,
  [InvalidMetadataExceptionCode.INVALID_STRING]: msg`Invalid string format.`,
  [InvalidMetadataExceptionCode.NOT_AVAILABLE]: msg`This name is not available.`,
};

export class InvalidMetadataException extends CustomException<InvalidMetadataExceptionCode> {
  constructor(
    message: string,
    code: InvalidMetadataExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        invalidMetadataExceptionUserFriendlyMessages[code],
    });
  }
}
