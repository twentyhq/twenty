import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

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

const objectMetadataExceptionUserFriendlyMessages: Record<
  ObjectMetadataExceptionCode,
  MessageDescriptor
> = {
  [ObjectMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND]: msg`Object not found.`,
  [ObjectMetadataExceptionCode.INVALID_OBJECT_INPUT]: msg`Invalid object input.`,
  [ObjectMetadataExceptionCode.OBJECT_MUTATION_NOT_ALLOWED]: msg`This object cannot be modified.`,
  [ObjectMetadataExceptionCode.OBJECT_ALREADY_EXISTS]: msg`An object with this name already exists.`,
  [ObjectMetadataExceptionCode.MISSING_CUSTOM_OBJECT_DEFAULT_LABEL_IDENTIFIER_FIELD]: msg`Custom object is missing a label identifier field.`,
  [ObjectMetadataExceptionCode.INVALID_ORM_OUTPUT]: msg`Invalid data format.`,
  [ObjectMetadataExceptionCode.INTERNAL_SERVER_ERROR]: msg`An unexpected error occurred.`,
  [ObjectMetadataExceptionCode.NAME_CONFLICT]: msg`A name conflict occurred.`,
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
        objectMetadataExceptionUserFriendlyMessages[code],
    });
  }
}
