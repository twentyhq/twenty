import { type GaxiosError } from 'gaxios';

import {
  ConnectedAccountRefreshAccessTokenException,
  ConnectedAccountRefreshAccessTokenExceptionCode,
} from 'src/engine/metadata-modules/connected-account/exceptions/connected-account-refresh-tokens.exception';
import { isGmailNetworkError } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/is-gmail-network-error.util';

/**
 * @see https://developers.google.com/identity/protocols/oauth2/web-server#authorization-errors
 */
const PERMANENT_OAUTH_ERROR_CODES = new Set([
  'invalid_grant',
  'invalid_client',
  'unauthorized_client',
  'unsupported_grant_type',
  'invalid_scope',
  'admin_policy_enforced',
]);

export const parseGoogleOAuthError = (
  error: unknown,
): ConnectedAccountRefreshAccessTokenException => {
  if (isGmailNetworkError(error)) {
    return new ConnectedAccountRefreshAccessTokenException(
      `Google refresh token network error: ${error.code} - ${error.message}`,
      ConnectedAccountRefreshAccessTokenExceptionCode.TEMPORARY_NETWORK_ERROR,
    );
  }

  const gaxiosError = error as GaxiosError;

  const googleOAuthError = {
    code: gaxiosError.response?.status,
    reason: gaxiosError.response?.data?.error || 'Unknown reason',
    message:
      gaxiosError.response?.data?.error_description ||
      gaxiosError.message ||
      'Unknown error',
  };

  if (PERMANENT_OAUTH_ERROR_CODES.has(googleOAuthError.reason)) {
    return new ConnectedAccountRefreshAccessTokenException(
      `Google auth error: ${googleOAuthError.reason} - ${googleOAuthError.message}`,
      ConnectedAccountRefreshAccessTokenExceptionCode.INVALID_REFRESH_TOKEN,
    );
  }

  return new ConnectedAccountRefreshAccessTokenException(
    `Google refresh token failed (${googleOAuthError.code ?? 'no status'}): ${googleOAuthError.reason} - ${googleOAuthError.message}`,
    ConnectedAccountRefreshAccessTokenExceptionCode.TEMPORARY_NETWORK_ERROR,
  );
};
