import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import {
  CustomException,
  type ExceptionCategory,
} from 'src/utils/custom-exception';

export enum ConnectedAccountExceptionCode {
  CONNECTED_ACCOUNT_NOT_FOUND = 'CONNECTED_ACCOUNT_NOT_FOUND',
  INVALID_CONNECTED_ACCOUNT_INPUT = 'INVALID_CONNECTED_ACCOUNT_INPUT',
  CONNECTED_ACCOUNT_OWNERSHIP_VIOLATION = 'CONNECTED_ACCOUNT_OWNERSHIP_VIOLATION',
}

const getConnectedAccountExceptionUserFriendlyMessage = (
  code: ConnectedAccountExceptionCode,
) => {
  switch (code) {
    case ConnectedAccountExceptionCode.CONNECTED_ACCOUNT_NOT_FOUND:
      return msg`Connected account not found.`;
    case ConnectedAccountExceptionCode.INVALID_CONNECTED_ACCOUNT_INPUT:
      return msg`Invalid connected account input.`;
    case ConnectedAccountExceptionCode.CONNECTED_ACCOUNT_OWNERSHIP_VIOLATION:
      return msg`You do not have access to this connected account.`;
    default:
      assertUnreachable(code);
  }
};
const CONNECTED_ACCOUNT_EXCEPTION_CATEGORY_BY_CODE = {
  [ConnectedAccountExceptionCode.CONNECTED_ACCOUNT_NOT_FOUND]: 'NOT_FOUND',
  [ConnectedAccountExceptionCode.INVALID_CONNECTED_ACCOUNT_INPUT]:
    'BAD_USER_INPUT',
  [ConnectedAccountExceptionCode.CONNECTED_ACCOUNT_OWNERSHIP_VIOLATION]:
    'FORBIDDEN',
} as const satisfies Record<ConnectedAccountExceptionCode, ExceptionCategory>;

export class ConnectedAccountException extends CustomException<ConnectedAccountExceptionCode> {
  constructor(
    message: string,
    code: ConnectedAccountExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getConnectedAccountExceptionUserFriendlyMessage(code),
      category: CONNECTED_ACCOUNT_EXCEPTION_CATEGORY_BY_CODE[code],
    });
  }
}
