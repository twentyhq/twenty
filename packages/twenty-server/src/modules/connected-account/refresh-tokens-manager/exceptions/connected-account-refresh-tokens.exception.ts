import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum ConnectedAccountRefreshAccessTokenExceptionCode {
  REFRESH_TOKEN_NOT_FOUND = 'REFRESH_TOKEN_NOT_FOUND',
  INVALID_REFRESH_TOKEN = 'INVALID_REFRESH_TOKEN',
  PROVIDER_NOT_SUPPORTED = 'PROVIDER_NOT_SUPPORTED',
  TEMPORARY_NETWORK_ERROR = 'TEMPORARY_NETWORK_ERROR',
  ACCESS_TOKEN_NOT_FOUND = 'ACCESS_TOKEN_NOT_FOUND',
}

const getConnectedAccountRefreshAccessTokenExceptionUserFriendlyMessage = (
  code: ConnectedAccountRefreshAccessTokenExceptionCode,
) => {
  switch (code) {
    case ConnectedAccountRefreshAccessTokenExceptionCode.REFRESH_TOKEN_NOT_FOUND:
      return msg`Refresh token not found.`;
    case ConnectedAccountRefreshAccessTokenExceptionCode.INVALID_REFRESH_TOKEN:
      return msg`Invalid refresh token.`;
    case ConnectedAccountRefreshAccessTokenExceptionCode.PROVIDER_NOT_SUPPORTED:
      return msg`This provider is not supported.`;
    case ConnectedAccountRefreshAccessTokenExceptionCode.TEMPORARY_NETWORK_ERROR:
      return msg`A temporary network error occurred.`;
    case ConnectedAccountRefreshAccessTokenExceptionCode.ACCESS_TOKEN_NOT_FOUND:
      return msg`Access token not found.`;
    default:
      assertUnreachable(code);
  }
};

export class ConnectedAccountRefreshAccessTokenException extends CustomException<ConnectedAccountRefreshAccessTokenExceptionCode> {
  constructor(
    message: string,
    code: ConnectedAccountRefreshAccessTokenExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getConnectedAccountRefreshAccessTokenExceptionUserFriendlyMessage(code),
    });
  }
}
