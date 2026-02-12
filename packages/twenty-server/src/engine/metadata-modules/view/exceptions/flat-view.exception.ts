import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { STANDARD_ERROR_MESSAGE } from 'src/engine/api/common/common-query-runners/errors/standard-error-message.constant';
import {
  appendCommonExceptionCode,
  CustomException,
} from 'src/utils/custom-exception';

export const FlatViewExceptionCode = appendCommonExceptionCode({
  VIEW_NOT_FOUND: 'VIEW_NOT_FOUND',
  VIEW_ALREADY_EXISTS: 'VIEW_ALREADY_EXISTS',
} as const);

const getFlatViewExceptionUserFriendlyMessage = (
  code: keyof typeof FlatViewExceptionCode,
) => {
  switch (code) {
    case FlatViewExceptionCode.VIEW_NOT_FOUND:
      return msg`View not found.`;
    case FlatViewExceptionCode.VIEW_ALREADY_EXISTS:
      return msg`View already exists.`;
    case FlatViewExceptionCode.INTERNAL_SERVER_ERROR:
      return STANDARD_ERROR_MESSAGE;
    default:
      assertUnreachable(code);
  }
};

export class FlatViewException extends CustomException<
  keyof typeof FlatViewExceptionCode
> {
  constructor(
    message: string,
    code: keyof typeof FlatViewExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? getFlatViewExceptionUserFriendlyMessage(code),
    });
  }
}
