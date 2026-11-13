import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import {
  appendCommonExceptionCode,
  CustomException,
} from 'src/utils/custom-exception';

export const MetadataOwnershipExceptionCode = appendCommonExceptionCode({
  MISSING_WORKSPACE_AUTH_CONTEXT: 'MISSING_WORKSPACE_AUTH_CONTEXT',
} as const);

const getMetadataOwnershipExceptionUserFriendlyMessage = (
  code: keyof typeof MetadataOwnershipExceptionCode,
) => {
  switch (code) {
    case MetadataOwnershipExceptionCode.MISSING_WORKSPACE_AUTH_CONTEXT:
      return msg`An unexpected error occurred.`;
    case MetadataOwnershipExceptionCode.INTERNAL_SERVER_ERROR:
      return msg`An unexpected error occurred.`;
    default:
      assertUnreachable(code);
  }
};

export class MetadataOwnershipException extends CustomException<
  keyof typeof MetadataOwnershipExceptionCode
> {
  constructor(
    message: string,
    code: keyof typeof MetadataOwnershipExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getMetadataOwnershipExceptionUserFriendlyMessage(code),
    });
  }
}
