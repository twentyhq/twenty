import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum FieldMetadataOptionExceptionCode {
  FIELD_METADATA_OPTION_NOT_FOUND = 'FIELD_METADATA_OPTION_NOT_FOUND',
  INVALID_FIELD_METADATA_OPTION_INPUT = 'INVALID_FIELD_METADATA_OPTION_INPUT',
}

const getFieldMetadataOptionExceptionUserFriendlyMessage = (
  code: FieldMetadataOptionExceptionCode,
) => {
  switch (code) {
    case FieldMetadataOptionExceptionCode.FIELD_METADATA_OPTION_NOT_FOUND:
      return msg`Field option not found.`;
    case FieldMetadataOptionExceptionCode.INVALID_FIELD_METADATA_OPTION_INPUT:
      return msg`Invalid field option input.`;
    default:
      assertUnreachable(code);
  }
};

export class FieldMetadataOptionException extends CustomException<FieldMetadataOptionExceptionCode> {
  constructor(
    message: string,
    code: FieldMetadataOptionExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getFieldMetadataOptionExceptionUserFriendlyMessage(code),
    });
  }
}
