import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

export class IndexMetadataException extends CustomException<IndexMetadataExceptionCode> {
  constructor(
    message: string,
    code: IndexMetadataExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? msg`An index metadata error occurred.`,
    });
  }
}

export enum IndexMetadataExceptionCode {
  INDEX_CREATION_FAILED = 'INDEX_CREATION_FAILED',
  INDEX_NOT_SUPPORTED_FOR_COMPOSITE_FIELD = 'INDEX_NOT_SUPPORTED_FOR_COMPOSITE_FIELD',
  INDEX_NOT_SUPPORTED_FOR_MORH_RELATION_FIELD_AND_RELATION_FIELD = 'INDEX_NOT_SUPPORTED_FOR_MORH_RELATION_FIELD_AND_RELATION_FIELD',
  CUSTOM_INDEX_LIMIT_REACHED = 'CUSTOM_INDEX_LIMIT_REACHED',
  CANNOT_DELETE_SYSTEM_INDEX = 'CANNOT_DELETE_SYSTEM_INDEX',
  INDEX_FIELDS_REQUIRED = 'INDEX_FIELDS_REQUIRED',
  DUPLICATE_INDEX_FIELDS = 'DUPLICATE_INDEX_FIELDS',
  INDEX_OBJECT_NOT_FOUND = 'INDEX_OBJECT_NOT_FOUND',
  INDEX_FIELD_NOT_FOUND_ON_OBJECT = 'INDEX_FIELD_NOT_FOUND_ON_OBJECT',
  INDEX_NOT_FOUND = 'INDEX_NOT_FOUND',
  INDEX_TYPE_NOT_SUPPORTED_FOR_FIELD_TYPE = 'INDEX_TYPE_NOT_SUPPORTED_FOR_FIELD_TYPE',
  DUPLICATE_UNIQUE_INDEX = 'DUPLICATE_UNIQUE_INDEX',
}
