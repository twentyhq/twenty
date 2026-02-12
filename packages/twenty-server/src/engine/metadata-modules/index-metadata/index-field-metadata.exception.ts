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
}
