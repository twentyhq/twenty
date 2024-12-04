import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';

export const parseGmailMessagesImportError = (error: {
  status?: number;
  reason: string;
  message: string;
}): MessageImportDriverException | undefined => {
  const { status, reason, message } = error;

  switch (status) {
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
    case 410:
      return undefined;

    case 429:
      return new MessageImportDriverException(
        message,
        MessageImportDriverExceptionCode.TEMPORARY_ERROR,
      );

    case 403:
      if (
        reason === 'rateLimitExceeded' ||
        reason === 'userRateLimitExceeded' ||
        reason === 'dailyLimitExceeded'
      ) {
        return new MessageImportDriverException(
          message,
          MessageImportDriverExceptionCode.TEMPORARY_ERROR,
        );
      }
      if (reason === 'domainPolicy') {
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

    case 500:
      if (reason === 'backendError') {
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
