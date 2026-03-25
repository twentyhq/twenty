import {
  AuthError,
  InteractionRequiredAuthError,
  ServerError,
} from '@azure/msal-node';

import {
  ConnectedAccountRefreshAccessTokenException,
  ConnectedAccountRefreshAccessTokenExceptionCode,
} from 'src/modules/connected-account/refresh-tokens-manager/exceptions/connected-account-refresh-tokens.exception';

/**
 * @see https://learn.microsoft.com/en-us/entra/identity-platform/reference-error-codes
 */
const PERMANENT_AUTH_ERROR_CODES = new Set([
  'invalid_grant',
  'invalid_client',
  'unauthorized_client',
  'invalid_request',
]);

/**
 * @see https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-common/src/error/ClientAuthErrorCodes.ts
 */
const TRANSIENT_AUTH_ERROR_CODES = new Set([
  'network_error',
  'no_network_connectivity',
  'endpoints_resolution_error',
  'openid_config_error',
  'request_cannot_be_made',
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

  if (error instanceof ServerError) {
    const status = error.status;

    if (status === 429) {
      return new ConnectedAccountRefreshAccessTokenException(
        'Microsoft rate limit exceeded',
        ConnectedAccountRefreshAccessTokenExceptionCode.TEMPORARY_NETWORK_ERROR,
      );
    }

    if (status && status >= 500 && status < 600) {
      return new ConnectedAccountRefreshAccessTokenException(
        `Microsoft server error (${status}): ${error.errorMessage}`,
        ConnectedAccountRefreshAccessTokenExceptionCode.TEMPORARY_NETWORK_ERROR,
      );
    }
  }

  if (error instanceof AuthError) {
    if (TRANSIENT_AUTH_ERROR_CODES.has(error.errorCode)) {
      return new ConnectedAccountRefreshAccessTokenException(
        `Microsoft network error: ${error.errorCode} - ${error.errorMessage}`,
        ConnectedAccountRefreshAccessTokenExceptionCode.TEMPORARY_NETWORK_ERROR,
      );
    }

    if (PERMANENT_AUTH_ERROR_CODES.has(error.errorCode)) {
      return new ConnectedAccountRefreshAccessTokenException(
        `Microsoft auth error: ${error.errorCode} - ${error.errorMessage}`,
        ConnectedAccountRefreshAccessTokenExceptionCode.INVALID_REFRESH_TOKEN,
      );
    }
  }

  const message = error instanceof Error ? error.message : String(error);

  return new ConnectedAccountRefreshAccessTokenException(
    `Microsoft token refresh failed: ${message}`,
    ConnectedAccountRefreshAccessTokenExceptionCode.INVALID_REFRESH_TOKEN,
  );
};
