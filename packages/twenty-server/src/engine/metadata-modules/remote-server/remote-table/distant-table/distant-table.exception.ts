import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import {
  appendCommonExceptionCode,
  CustomException,
} from 'src/utils/custom-exception';

export const DistantTableExceptionCode = appendCommonExceptionCode({
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
} as const);

const getDistantTableExceptionUserFriendlyMessage = (
  code: keyof typeof DistantTableExceptionCode,
) => {
  switch (code) {
    case DistantTableExceptionCode.TIMEOUT_ERROR:
      return msg`Request timed out.`;
    case DistantTableExceptionCode.INTERNAL_SERVER_ERROR:
      return msg`An unexpected error occurred.`;
    default:
      assertUnreachable(code);
  }
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
        userFriendlyMessage ??
        getDistantTableExceptionUserFriendlyMessage(code),
    });
  }
}
