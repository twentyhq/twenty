import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';

export const parseGmailError = (error: {
  code?: number;
  reason: string;
  message: string;
}): MessageImportDriverException => {
  const { code, reason, message } = error;

  switch (code) {
    case 400:
      if (reason === 'invalid_grant') {
        return new MessageImportDriverException(
          message,
          MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
        );
      }
      if (reason === 'failedPrecondition') {
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
        MessageImportDriverExceptionCode.NOT_FOUND,
      );

    case 429:
      return new MessageImportDriverException(
        message,
        MessageImportDriverExceptionCode.TEMPORARY_ERROR,
      );

    case 403:
      if (
        reason === 'rateLimitExceeded' ||
        reason === 'userRateLimitExceeded'
      ) {
        return new MessageImportDriverException(
          message,
          MessageImportDriverExceptionCode.TEMPORARY_ERROR,
        );
      } else {
        return new MessageImportDriverException(
          message,
          MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
        );
      }

    case 401:
      return new MessageImportDriverException(
        message,
        MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
      );

    case 500:
      if (reason === 'backendError') {
        return new MessageImportDriverException(
          message,
          MessageImportDriverExceptionCode.TEMPORARY_ERROR,
        );
      } else {
        return new MessageImportDriverException(
          message,
          MessageImportDriverExceptionCode.UNKNOWN,
        );
      }

    default:
      break;
  }

  return new MessageImportDriverException(
    message,
    MessageImportDriverExceptionCode.UNKNOWN,
  );
};
