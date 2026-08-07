import { type GaxiosError } from 'gaxios';

import {
  ConnectedAccountRefreshAccessTokenException,
  ConnectedAccountRefreshAccessTokenExceptionCode,
} from 'src/engine/metadata-modules/connected-account/exceptions/connected-account-refresh-tokens.exception';
import { GOOGLE_PERMANENT_OAUTH_ERROR_CODES } from 'src/modules/connected-account/refresh-tokens-manager/drivers/google/constants/google-permanent-oauth-error-codes.constant';
import { isGmailNetworkError } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/is-gmail-network-error.util';

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

  if (GOOGLE_PERMANENT_OAUTH_ERROR_CODES.has(googleOAuthError.reason)) {
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
