import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import { CustomException } from 'src/utils/custom-exception';

export enum ObjectMetadataExceptionCode {
  OBJECT_METADATA_NOT_FOUND = 'OBJECT_METADATA_NOT_FOUND',
  INVALID_OBJECT_INPUT = 'INVALID_OBJECT_INPUT',
  OBJECT_MUTATION_NOT_ALLOWED = 'OBJECT_MUTATION_NOT_ALLOWED',
  OBJECT_ALREADY_EXISTS = 'OBJECT_ALREADY_EXISTS',
  MISSING_CUSTOM_OBJECT_DEFAULT_LABEL_IDENTIFIER_FIELD = 'MISSING_CUSTOM_OBJECT_DEFAULT_LABEL_IDENTIFIER_FIELD',
  INVALID_ORM_OUTPUT = 'INVALID_ORM_OUTPUT',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  NAME_CONFLICT = 'NAME_CONFLICT',
}

const getObjectMetadataExceptionUserFriendlyMessage = (
  code: ObjectMetadataExceptionCode,
) => {
  switch (code) {
    case ObjectMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND:
      return msg`Object not found.`;
    case ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT:
      return msg`Invalid object input.`;
    case ObjectMetadataExceptionCode.OBJECT_MUTATION_NOT_ALLOWED:
      return msg`This object cannot be modified.`;
    case ObjectMetadataExceptionCode.OBJECT_ALREADY_EXISTS:
      return msg`An object with this name already exists.`;
    case ObjectMetadataExceptionCode.MISSING_CUSTOM_OBJECT_DEFAULT_LABEL_IDENTIFIER_FIELD:
      return msg`Custom object is missing a label identifier field.`;
    case ObjectMetadataExceptionCode.INVALID_ORM_OUTPUT:
      return msg`Invalid data format.`;
    case ObjectMetadataExceptionCode.INTERNAL_SERVER_ERROR:
      return STANDARD_ERROR_MESSAGE;
    case ObjectMetadataExceptionCode.NAME_CONFLICT:
      return msg`A name conflict occurred.`;
    default:
      assertUnreachable(code);
  }
};

export class ObjectMetadataException extends CustomException<ObjectMetadataExceptionCode> {
  constructor(
    message: string,
    code: ObjectMetadataExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getObjectMetadataExceptionUserFriendlyMessage(code),
    });
  }
}
