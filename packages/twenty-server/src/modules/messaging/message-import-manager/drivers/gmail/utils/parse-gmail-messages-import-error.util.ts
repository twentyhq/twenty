import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';

export const parseGmailMessagesImportError = (
  error: {
    code?: number;
    errors: {
      reason: string;
      message: string;
    }[];
  },
  messageExternalId: string,
  options?: { cause?: Error },
): MessageImportDriverException | undefined => {
  const { code, errors } = error;

  const reason = errors?.[0]?.reason;
  const originalMessage = errors?.[0]?.message;
  const message = `${errors?.[0]?.message} for message with externalId: ${messageExternalId}`;

  switch (code) {
    case 400:
      if (reason === 'invalid_grant') {
        return new MessageImportDriverException(
          message,
          MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
          { cause: options?.cause },
        );
      }
      if (reason === 'failedPrecondition') {
        if (originalMessage.includes('Mail service not enabled')) {
          return new MessageImportDriverException(
            message,
            MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
            { cause: options?.cause },
          );
        }

        return new MessageImportDriverException(
          message,
          MessageImportDriverExceptionCode.TEMPORARY_ERROR,
          { cause: options?.cause },
        );
      }

      return new MessageImportDriverException(
        message,
        MessageImportDriverExceptionCode.UNKNOWN,
        { cause: options?.cause },
      );

    case 404:
    case 410:
      return undefined;

    case 429:
      return new MessageImportDriverException(
        message,
        MessageImportDriverExceptionCode.TEMPORARY_ERROR,
        { cause: options?.cause },
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
          { cause: options?.cause },
        );
      }
      if (reason === 'domainPolicy') {
        return new MessageImportDriverException(
          message,
          MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
          { cause: options?.cause },
        );
      }

      break;

    case 401:
      return new MessageImportDriverException(
        message,
        MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
        { cause: options?.cause },
      );

    case 503:
      return new MessageImportDriverException(
        message,
        MessageImportDriverExceptionCode.TEMPORARY_ERROR,
        { cause: options?.cause },
      );

    case 500:
    case 502:
    case 504:
      if (reason === 'backendError') {
        return new MessageImportDriverException(
          message,
          MessageImportDriverExceptionCode.TEMPORARY_ERROR,
          { cause: options?.cause },
        );
      }

      if (errors?.[0]?.message.includes(`Authentication backend unavailable`)) {
        return new MessageImportDriverException(
          `${code} - ${reason} - ${message}`,
          MessageImportDriverExceptionCode.TEMPORARY_ERROR,
          { cause: options?.cause },
        );
      }
      break;

    default:
      break;
  }

  return new MessageImportDriverException(
    message,
    MessageImportDriverExceptionCode.UNKNOWN,
    { cause: options?.cause },
  );
};
