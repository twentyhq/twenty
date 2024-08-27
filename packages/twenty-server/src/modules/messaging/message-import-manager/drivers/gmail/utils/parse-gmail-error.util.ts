import {
  MessagingDriverException,
  MessagingDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/messaging-driver.exception';

export const parseGmailError = (error: {
  code?: number;
  reason: string;
  message: string;
}): MessagingDriverException => {
  const { code, reason, message } = error;

  switch (code) {
    case 400:
      if (reason === 'invalid_grant') {
        return new MessagingDriverException(
          message,
          MessagingDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
        );
      }
      if (reason === 'failedPrecondition') {
        return new MessagingDriverException(
          message,
          MessagingDriverExceptionCode.TEMPORARY_ERROR,
        );
      }

      return new MessagingDriverException(
        message,
        MessagingDriverExceptionCode.UNKNOWN,
      );

    case 404:
      return new MessagingDriverException(
        message,
        MessagingDriverExceptionCode.NOT_FOUND,
      );

    case 429:
      return new MessagingDriverException(
        message,
        MessagingDriverExceptionCode.TEMPORARY_ERROR,
      );

    case 403:
      if (
        reason === 'rateLimitExceeded' ||
        reason === 'userRateLimitExceeded'
      ) {
        return new MessagingDriverException(
          message,
          MessagingDriverExceptionCode.TEMPORARY_ERROR,
        );
      } else {
        return new MessagingDriverException(
          message,
          MessagingDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
        );
      }

    case 401:
      return new MessagingDriverException(
        message,
        MessagingDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
      );

    case 500:
      if (reason === 'backendError') {
        return new MessagingDriverException(
          message,
          MessagingDriverExceptionCode.TEMPORARY_ERROR,
        );
      } else {
        return new MessagingDriverException(
          message,
          MessagingDriverExceptionCode.UNKNOWN,
        );
      }

    default:
      break;
  }

  return new MessagingDriverException(
    message,
    MessagingDriverExceptionCode.UNKNOWN,
  );
};
