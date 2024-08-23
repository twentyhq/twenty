import { GmailError } from 'src/modules/messaging/message-import-manager/drivers/gmail/types/gmail-error.type';
import {
  MessagingException,
  MessagingExceptionCode,
} from 'src/modules/messaging/message-import-manager/exceptions/messaging.exception';

export const parseGmailError = (error: GmailError): MessagingException => {
  const { code, reason, message } = error;

  switch (code) {
    case 400:
      if (reason === 'invalid_grant') {
        return new MessagingException(
          message,
          MessagingExceptionCode.INSUFFICIENT_PERMISSIONS,
        );
      }
      if (reason === 'failedPrecondition') {
        return new MessagingException(
          message,
          MessagingExceptionCode.TEMPORARY_ERROR,
        );
      }

      return new MessagingException(message, MessagingExceptionCode.UNKNOWN);

    case 404:
      return new MessagingException(message, MessagingExceptionCode.NOT_FOUND);

    case 429:
      return new MessagingException(
        message,
        MessagingExceptionCode.TEMPORARY_ERROR,
      );

    case 403:
      if (
        reason === 'rateLimitExceeded' ||
        reason === 'userRateLimitExceeded'
      ) {
        return new MessagingException(
          message,
          MessagingExceptionCode.TEMPORARY_ERROR,
        );
      } else {
        return new MessagingException(
          message,
          MessagingExceptionCode.INSUFFICIENT_PERMISSIONS,
        );
      }

    case 401:
      return new MessagingException(
        message,
        MessagingExceptionCode.INSUFFICIENT_PERMISSIONS,
      );

    case 500:
      if (reason === 'backendError') {
        return new MessagingException(
          message,
          MessagingExceptionCode.TEMPORARY_ERROR,
        );
      } else {
        return new MessagingException(message, MessagingExceptionCode.UNKNOWN);
      }

    default:
      break;
  }

  return new MessagingException(message, MessagingExceptionCode.UNKNOWN);
};
