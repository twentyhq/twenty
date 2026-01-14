import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import {
  appendCommonExceptionCode,
  CustomException,
} from 'src/utils/custom-exception';

export const WorkspaceCacheExceptionCode = appendCommonExceptionCode({
  MISSING_DECORATOR: 'MISSING_DECORATOR',
  INVALID_PARAMETERS: 'INVALID_PARAMETERS',
} as const);

const getWorkspaceCacheExceptionUserFriendlyMessage = (
  code: keyof typeof WorkspaceCacheExceptionCode,
) => {
  switch (code) {
    case WorkspaceCacheExceptionCode.MISSING_DECORATOR:
      return msg`Missing decorator configuration.`;
    case WorkspaceCacheExceptionCode.INVALID_PARAMETERS:
      return msg`Invalid parameters provided.`;
    case WorkspaceCacheExceptionCode.INTERNAL_SERVER_ERROR:
      return msg`An unexpected error occurred.`;
    default:
      assertUnreachable(code);
  }
};

export class WorkspaceCacheException extends CustomException<
  keyof typeof WorkspaceCacheExceptionCode
> {
  constructor(
    message: string,
    code: keyof typeof WorkspaceCacheExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getWorkspaceCacheExceptionUserFriendlyMessage(code),
    });
  }
}
