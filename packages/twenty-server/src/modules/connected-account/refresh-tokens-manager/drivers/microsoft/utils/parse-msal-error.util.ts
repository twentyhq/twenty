import { AuthError, InteractionRequiredAuthError } from '@azure/msal-node';

import {
  ConnectedAccountRefreshAccessTokenException,
  ConnectedAccountRefreshAccessTokenExceptionCode,
} from 'src/engine/metadata-modules/connected-account/exceptions/connected-account-refresh-tokens.exception';
import { MICROSOFT_PERMANENT_AUTH_ERROR_CODES } from 'src/modules/connected-account/refresh-tokens-manager/drivers/microsoft/constants/microsoft-permanent-auth-error-codes.constant';

export const parseMsalError = (
  error: unknown,
): ConnectedAccountRefreshAccessTokenException => {
  if (error instanceof InteractionRequiredAuthError) {
    return new ConnectedAccountRefreshAccessTokenException(
      `Microsoft token refresh requires re-authentication: ${error.errorCode}`,
      ConnectedAccountRefreshAccessTokenExceptionCode.INVALID_REFRESH_TOKEN,
    );
  }

  if (
    error instanceof AuthError &&
    MICROSOFT_PERMANENT_AUTH_ERROR_CODES.has(error.errorCode)
  ) {
    return new ConnectedAccountRefreshAccessTokenException(
      `Microsoft auth error: ${error.errorCode} - ${error.errorMessage}`,
      ConnectedAccountRefreshAccessTokenExceptionCode.INVALID_REFRESH_TOKEN,
    );
  }

  const message = error instanceof Error ? error.message : String(error);

  return new ConnectedAccountRefreshAccessTokenException(
    `Microsoft token refresh failed: ${message}`,
    ConnectedAccountRefreshAccessTokenExceptionCode.TEMPORARY_NETWORK_ERROR,
  );
};
