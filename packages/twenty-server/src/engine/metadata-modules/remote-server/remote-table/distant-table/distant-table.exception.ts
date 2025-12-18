import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import {
  appendCommonExceptionCode,
  CustomException,
} from 'src/utils/custom-exception';

export const DistantTableExceptionCode = appendCommonExceptionCode({
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
} as const);

const distantTableExceptionUserFriendlyMessages: Record<
  keyof typeof DistantTableExceptionCode,
  MessageDescriptor
> = {
  TIMEOUT_ERROR: msg`Request timed out.`,
  INTERNAL_SERVER_ERROR: msg`An unexpected error occurred.`,
};

export class DistantTableException extends CustomException<
  keyof typeof DistantTableExceptionCode
> {
  constructor(
    message: string,
    code: keyof typeof DistantTableExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? distantTableExceptionUserFriendlyMessages[code],
    });
  }
}
