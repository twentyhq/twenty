import { GmailError } from 'src/modules/messaging/message-import-manager/services/messaging-error-handling.service';
import {
  MessagingError,
  MessagingErrorCode,
} from 'src/modules/messaging/message-import-manager/types/messaging-error.type';

export const parseGmailError = (error: GmailError): MessagingError => {
  const { code, reason, message } = error;

  switch (code) {
    case 400:
      if (reason === 'invalid_grant') {
        return {
          code: MessagingErrorCode.INSUFFICIENT_PERMISSIONS,
          message,
        };
      }
      if (reason === 'failedPrecondition') {
        return {
          code: MessagingErrorCode.TEMPORARY_ERROR,
          message,
        };
      }

      return {
        code: MessagingErrorCode.UNKNOWN,
        message,
      };

    case 404:
      return {
        code: MessagingErrorCode.NOT_FOUND,
        message,
      };

    case 429:
      return {
        code: MessagingErrorCode.TEMPORARY_ERROR,
        message,
      };

    case 403:
      if (
        reason === 'rateLimitExceeded' ||
        reason === 'userRateLimitExceeded'
      ) {
        return {
          code: MessagingErrorCode.TEMPORARY_ERROR,
          message,
        };
      } else {
        return {
          code: MessagingErrorCode.INSUFFICIENT_PERMISSIONS,
          message,
        };
      }

    case 401:
      return {
        code: MessagingErrorCode.INSUFFICIENT_PERMISSIONS,
        message,
      };

    case 500:
      if (reason === 'backendError') {
        return {
          code: MessagingErrorCode.TEMPORARY_ERROR,
          message,
        };
      } else {
        return {
          code: MessagingErrorCode.UNKNOWN,
          message,
        };
      }

    default:
      break;
  }

  return {
    code: MessagingErrorCode.UNKNOWN,
    message,
  };
};
