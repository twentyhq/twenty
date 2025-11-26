import { type GmailFoldersError } from 'src/modules/messaging/message-folder-manager/drivers/gmail/types/gmail-folders-error.type';
import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';

export const parseGmailFoldersError = (
  error: GmailFoldersError,
): MessageImportDriverException => {
  const { code, message } = error;

  switch (code) {
    case '400':
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

    case '429':
      return new MessageImportDriverException(
        message,
        MessageImportDriverExceptionCode.TEMPORARY_ERROR,
      );

    case '403':
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

    case '401':
      return new MessageImportDriverException(
        message,
        MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
      );

    case '503':
      return new MessageImportDriverException(
        message,
        MessageImportDriverExceptionCode.TEMPORARY_ERROR,
      );

    case '500':
    case '502':
    case '504':
      if (message === 'backendError') {
        return new MessageImportDriverException(
          message,
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
