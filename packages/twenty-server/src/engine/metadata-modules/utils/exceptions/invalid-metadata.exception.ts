import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

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

const getInvalidMetadataExceptionUserFriendlyMessage = (
  code: InvalidMetadataExceptionCode,
) => {
  switch (code) {
    case InvalidMetadataExceptionCode.LABEL_REQUIRED:
      return msg`Label is required.`;
    case InvalidMetadataExceptionCode.INPUT_TOO_SHORT:
      return msg`Input is too short.`;
    case InvalidMetadataExceptionCode.EXCEEDS_MAX_LENGTH:
      return msg`Input exceeds maximum length.`;
    case InvalidMetadataExceptionCode.RESERVED_KEYWORD:
      return msg`This name is a reserved keyword.`;
    case InvalidMetadataExceptionCode.NOT_CAMEL_CASE:
      return msg`Name must be in camelCase format.`;
    case InvalidMetadataExceptionCode.INVALID_LABEL:
      return msg`Invalid label format.`;
    case InvalidMetadataExceptionCode.NAME_NOT_SYNCED_WITH_LABEL:
      return msg`Name is not synced with label.`;
    case InvalidMetadataExceptionCode.INVALID_STRING:
      return msg`Invalid string format.`;
    case InvalidMetadataExceptionCode.NOT_AVAILABLE:
      return msg`This name is not available.`;
    default:
      assertUnreachable(code);
  }
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
        getInvalidMetadataExceptionUserFriendlyMessage(code),
    });
  }
}
