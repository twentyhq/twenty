import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

export enum ConnectedAccountRefreshAccessTokenExceptionCode {
  REFRESH_TOKEN_NOT_FOUND = 'REFRESH_TOKEN_NOT_FOUND',
  INVALID_REFRESH_TOKEN = 'INVALID_REFRESH_TOKEN',
  PROVIDER_NOT_SUPPORTED = 'PROVIDER_NOT_SUPPORTED',
  TEMPORARY_NETWORK_ERROR = 'TEMPORARY_NETWORK_ERROR',
  ACCESS_TOKEN_NOT_FOUND = 'ACCESS_TOKEN_NOT_FOUND',
}

const connectedAccountRefreshAccessTokenExceptionUserFriendlyMessages: Record<
  ConnectedAccountRefreshAccessTokenExceptionCode,
  MessageDescriptor
> = {
  [ConnectedAccountRefreshAccessTokenExceptionCode.REFRESH_TOKEN_NOT_FOUND]: msg`Refresh token not found.`,
  [ConnectedAccountRefreshAccessTokenExceptionCode.INVALID_REFRESH_TOKEN]: msg`Invalid refresh token.`,
  [ConnectedAccountRefreshAccessTokenExceptionCode.PROVIDER_NOT_SUPPORTED]: msg`This provider is not supported.`,
  [ConnectedAccountRefreshAccessTokenExceptionCode.TEMPORARY_NETWORK_ERROR]: msg`A temporary network error occurred.`,
  [ConnectedAccountRefreshAccessTokenExceptionCode.ACCESS_TOKEN_NOT_FOUND]: msg`Access token not found.`,
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
        connectedAccountRefreshAccessTokenExceptionUserFriendlyMessages[code],
    });
  }
}
