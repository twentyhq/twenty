import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { type GmailApiError } from 'src/modules/messaging/message-import-manager/drivers/gmail/types/gmail-api-error.type';

export const parseGmailApiError = (
  error: GmailApiError,
): MessageImportDriverException => {
  const { code, message } = error;

  const codeAsNumber = Number(code);

  switch (codeAsNumber) {
    case 400:
      if (message === 'invalid_grant') {
        return new MessageImportDriverException(
          message,
          MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
        );
      }
      if (message === 'failedPrecondition') {
        if (message.includes('Mail service not enabled')) {
          return new MessageImportDriverException(
            message,
            MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
          );
        }

        return new MessageImportDriverException(
          message,
          MessageImportDriverExceptionCode.TEMPORARY_ERROR,
        );
      }

      return new MessageImportDriverException(
        message,
        MessageImportDriverExceptionCode.UNKNOWN,
      );

    case 404:
      return new MessageImportDriverException(
        message,
        MessageImportDriverExceptionCode.SYNC_CURSOR_ERROR,
      );

    case 429:
      return new MessageImportDriverException(
        message,
        MessageImportDriverExceptionCode.TEMPORARY_ERROR,
      );

    case 403:
      if (
        message === 'rateLimitExceeded' ||
        message === 'userRateLimitExceeded' ||
        message === 'dailyLimitExceeded'
      ) {
        return new MessageImportDriverException(
          message,
          MessageImportDriverExceptionCode.TEMPORARY_ERROR,
        );
      }
      if (message === 'domainPolicy') {
        return new MessageImportDriverException(
          message,
          MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
        );
      }

      break;

    case 401:
      return new MessageImportDriverException(
        message,
        MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
      );

    case 503:
      return new MessageImportDriverException(
        message,
        MessageImportDriverExceptionCode.TEMPORARY_ERROR,
      );

    case 500:
    case 502:
    case 504:
      if (message === 'backendError') {
        return new MessageImportDriverException(
          message,
          MessageImportDriverExceptionCode.TEMPORARY_ERROR,
        );
      }

      if (message.includes(`Authentication backend unavailable`)) {
        return new MessageImportDriverException(
          `${code} - ${message}`,
          MessageImportDriverExceptionCode.TEMPORARY_ERROR,
        );
      }
      break;

    default:
      break;
  }

  return new MessageImportDriverException(
    message,
    MessageImportDriverExceptionCode.UNKNOWN,
  );
};
