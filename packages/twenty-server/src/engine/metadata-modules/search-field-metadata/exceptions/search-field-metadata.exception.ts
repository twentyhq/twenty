import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

export class SearchFieldMetadataException extends CustomException<SearchFieldMetadataExceptionCode> {
  constructor(
    message: string,
    code: SearchFieldMetadataExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? msg`A search field metadata error occurred.`,
    });
  }
}

export enum SearchFieldMetadataExceptionCode {
  SEARCH_FIELD_METADATA_NOT_FOUND = 'SEARCH_FIELD_METADATA_NOT_FOUND',
  INVALID_SEARCH_FIELD_METADATA_DATA = 'INVALID_SEARCH_FIELD_METADATA_DATA',
  OBJECT_METADATA_NOT_FOUND = 'OBJECT_METADATA_NOT_FOUND',
  FIELD_METADATA_NOT_FOUND = 'FIELD_METADATA_NOT_FOUND',
}
