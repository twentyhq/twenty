import { AuthError, InteractionRequiredAuthError } from '@azure/msal-node';

import {
  ConnectedAccountRefreshAccessTokenException,
  ConnectedAccountRefreshAccessTokenExceptionCode,
} from 'src/engine/metadata-modules/connected-account/exceptions/connected-account-refresh-tokens.exception';

/**
 * @see https://learn.microsoft.com/en-us/entra/identity-platform/reference-error-codes
 */
const PERMANENT_AUTH_ERROR_CODES = new Set([
  'invalid_grant',
  'invalid_client',
  'unauthorized_client',
  'invalid_request',
]);

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
    PERMANENT_AUTH_ERROR_CODES.has(error.errorCode)
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
