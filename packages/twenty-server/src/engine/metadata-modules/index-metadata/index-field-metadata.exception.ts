import { type MessageDescriptor } from '@lingui/core';

import { CustomException } from 'src/utils/custom-exception';

export class IndexMetadataException extends CustomException {
  declare code: IndexMetadataExceptionCode;
  constructor(
    message: string,
    code: IndexMetadataExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, { userFriendlyMessage });
  }
}

export enum IndexMetadataExceptionCode {
  INDEX_CREATION_FAILED = 'INDEX_CREATION_FAILED',
  INDEX_NOT_SUPPORTED_FOR_COMPOSITE_FIELD = 'INDEX_NOT_SUPPORTED_FOR_COMPOSITE_FIELD',
  INDEX_NOT_SUPPORTED_FOR_MORH_RELATION_FIELD_AND_RELATION_FIELD = 'INDEX_NOT_SUPPORTED_FOR_MORH_RELATION_FIELD_AND_RELATION_FIELD',
}
