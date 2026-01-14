import { type GaxiosError } from 'gaxios';

import {
  ConnectedAccountRefreshAccessTokenException,
  ConnectedAccountRefreshAccessTokenExceptionCode,
} from 'src/modules/connected-account/refresh-tokens-manager/exceptions/connected-account-refresh-tokens.exception';
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
    reason:
      gaxiosError.response?.data?.error ||
      gaxiosError.response?.data?.error_description ||
      'Unknown reason',
    message:
      gaxiosError.response?.data?.error_description ||
      gaxiosError.message ||
      'Unknown error',
  };

  switch (googleOAuthError.code) {
    case 400:
      if (googleOAuthError.reason === 'invalid_grant') {
        return new ConnectedAccountRefreshAccessTokenException(
          googleOAuthError.message,
          ConnectedAccountRefreshAccessTokenExceptionCode.INVALID_REFRESH_TOKEN,
        );
      }

      return new ConnectedAccountRefreshAccessTokenException(
        googleOAuthError.message,
        ConnectedAccountRefreshAccessTokenExceptionCode.INVALID_REFRESH_TOKEN,
      );

    case 401:
      return new ConnectedAccountRefreshAccessTokenException(
        googleOAuthError.message,
        ConnectedAccountRefreshAccessTokenExceptionCode.INVALID_REFRESH_TOKEN,
      );

    case 403:
      return new ConnectedAccountRefreshAccessTokenException(
        googleOAuthError.message,
        ConnectedAccountRefreshAccessTokenExceptionCode.INVALID_REFRESH_TOKEN,
      );

    case 429:
      return new ConnectedAccountRefreshAccessTokenException(
        googleOAuthError.message,
        ConnectedAccountRefreshAccessTokenExceptionCode.TEMPORARY_NETWORK_ERROR,
      );

    case 500:
    case 502:
    case 503:
    case 504:
      return new ConnectedAccountRefreshAccessTokenException(
        `${googleOAuthError.code} - ${googleOAuthError.message}`,
        ConnectedAccountRefreshAccessTokenExceptionCode.TEMPORARY_NETWORK_ERROR,
      );

    default:
      break;
  }

  return new ConnectedAccountRefreshAccessTokenException(
    `Google refresh token failed: ${googleOAuthError.message}`,
    ConnectedAccountRefreshAccessTokenExceptionCode.INVALID_REFRESH_TOKEN,
  );
};
