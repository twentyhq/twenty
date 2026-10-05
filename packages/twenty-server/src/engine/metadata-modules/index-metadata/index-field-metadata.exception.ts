import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import {
  CustomException,
  type ExceptionCategory,
} from 'src/utils/custom-exception';

export class IndexMetadataException extends CustomException<IndexMetadataExceptionCode> {
  constructor(
    message: string,
    code: IndexMetadataExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? msg`An index metadata error occurred.`,
      category: INDEX_METADATA_EXCEPTION_CATEGORY_BY_CODE[code],
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
const INDEX_METADATA_EXCEPTION_CATEGORY_BY_CODE = {
  [IndexMetadataExceptionCode.INDEX_CREATION_FAILED]: 'INTERNAL_SERVER_ERROR',
  [IndexMetadataExceptionCode.INDEX_NOT_SUPPORTED_FOR_COMPOSITE_FIELD]:
    'BAD_USER_INPUT',
  [IndexMetadataExceptionCode.INDEX_NOT_SUPPORTED_FOR_MORH_RELATION_FIELD_AND_RELATION_FIELD]:
    'BAD_USER_INPUT',
  [IndexMetadataExceptionCode.CUSTOM_INDEX_LIMIT_REACHED]: 'CONFLICT',
  [IndexMetadataExceptionCode.CANNOT_DELETE_SYSTEM_INDEX]: 'FORBIDDEN',
  [IndexMetadataExceptionCode.INDEX_FIELDS_REQUIRED]: 'BAD_USER_INPUT',
  [IndexMetadataExceptionCode.DUPLICATE_INDEX_FIELDS]: 'BAD_USER_INPUT',
  [IndexMetadataExceptionCode.INDEX_OBJECT_NOT_FOUND]: 'NOT_FOUND',
  [IndexMetadataExceptionCode.INDEX_FIELD_NOT_FOUND_ON_OBJECT]:
    'BAD_USER_INPUT',
  [IndexMetadataExceptionCode.INDEX_NOT_FOUND]: 'NOT_FOUND',
  [IndexMetadataExceptionCode.INDEX_TYPE_NOT_SUPPORTED_FOR_FIELD_TYPE]:
    'BAD_USER_INPUT',
  [IndexMetadataExceptionCode.DUPLICATE_UNIQUE_INDEX]: 'BAD_USER_INPUT',
} as const satisfies Record<IndexMetadataExceptionCode, ExceptionCategory>;
