import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import {
  appendCommonExceptionCode,
  CustomException,
} from 'src/utils/custom-exception';

export const WorkspaceCacheExceptionCode = appendCommonExceptionCode({
  MISSING_DECORATOR: 'MISSING_DECORATOR',
  INVALID_PARAMETERS: 'INVALID_PARAMETERS',
} as const);

const workspaceCacheExceptionUserFriendlyMessages: Record<
  keyof typeof WorkspaceCacheExceptionCode,
  MessageDescriptor
> = {
  MISSING_DECORATOR: msg`Missing decorator configuration.`,
  INVALID_PARAMETERS: msg`Invalid parameters provided.`,
  INTERNAL_SERVER_ERROR: msg`An unexpected error occurred.`,
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
        workspaceCacheExceptionUserFriendlyMessages[code],
    });
  }
}
