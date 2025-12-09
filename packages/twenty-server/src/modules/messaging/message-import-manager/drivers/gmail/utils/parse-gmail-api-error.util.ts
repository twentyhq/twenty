import { type GaxiosError } from 'gaxios';

import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';

export const parseGmailApiError = (
  error: GaxiosError,
): MessageImportDriverException => {
  const gmailApiError = {
    code: error.response?.status,
    reason:
      error.response?.data?.error?.errors?.[0].reason ||
      error.response?.data?.error ||
      'Unknown reason',
    message:
      error.response?.data?.error?.errors?.[0].message ||
      error.response?.data?.error_description ||
      'Unknown error',
  };

  switch (gmailApiError.code) {
    case 400:
      if (gmailApiError.reason === 'invalid_grant') {
        return new MessageImportDriverException(
          gmailApiError.message,
          MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
        );
      }
      if (gmailApiError.reason === 'failedPrecondition') {
        if (gmailApiError.message.includes('Mail service not enabled')) {
          return new MessageImportDriverException(
            gmailApiError.message,
            MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
          );
        }

        return new MessageImportDriverException(
          gmailApiError.message,
          MessageImportDriverExceptionCode.TEMPORARY_ERROR,
        );
      }

      return new MessageImportDriverException(
        gmailApiError.message,
        MessageImportDriverExceptionCode.UNKNOWN,
      );

    case 404:
      return new MessageImportDriverException(
        gmailApiError.message,
        MessageImportDriverExceptionCode.SYNC_CURSOR_ERROR,
      );

    case 429:
      return new MessageImportDriverException(
        gmailApiError.message,
        MessageImportDriverExceptionCode.TEMPORARY_ERROR,
      );

    case 403:
      if (
        gmailApiError.reason === 'rateLimitExceeded' ||
        gmailApiError.reason === 'userRateLimitExceeded' ||
        gmailApiError.reason === 'dailyLimitExceeded'
      ) {
        return new MessageImportDriverException(
          gmailApiError.message,
          MessageImportDriverExceptionCode.TEMPORARY_ERROR,
        );
      }
      if (gmailApiError.reason === 'domainPolicy') {
        return new MessageImportDriverException(
          gmailApiError.message,
          MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
        );
      }

      if (gmailApiError.reason === 'insufficientPermissions') {
        return new MessageImportDriverException(
          gmailApiError.message,
          MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
        );
      }

      break;

    case 401:
      return new MessageImportDriverException(
        gmailApiError.message,
        MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
      );

    case 503:
      return new MessageImportDriverException(
        gmailApiError.message,
        MessageImportDriverExceptionCode.TEMPORARY_ERROR,
      );

    case 500:
    case 502:
    case 504:
      if (gmailApiError.reason === 'backendError') {
        return new MessageImportDriverException(
          gmailApiError.message,
          MessageImportDriverExceptionCode.TEMPORARY_ERROR,
        );
      }

      if (
        gmailApiError.message.includes(`Authentication backend unavailable`)
      ) {
        return new MessageImportDriverException(
          `${gmailApiError.code} - ${gmailApiError.message}`,
          MessageImportDriverExceptionCode.TEMPORARY_ERROR,
        );
      }
      break;

    default:
      break;
  }

  return new MessageImportDriverException(
    gmailApiError.message,
    MessageImportDriverExceptionCode.UNKNOWN,
  );
};
