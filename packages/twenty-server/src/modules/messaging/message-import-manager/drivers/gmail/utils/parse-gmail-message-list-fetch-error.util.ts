import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';

export const parseGmailMessageListFetchError = (
  error: {
    code?: number;
    errors: {
      reason: string;
      message: string;
    }[];
  },
  options?: { cause?: Error },
): MessageImportDriverException => {
  const { code, errors } = error;

  const reason = errors?.[0]?.reason;
  const message = errors?.[0]?.message;

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
        if (message.includes('Mail service not enabled')) {
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
      return new MessageImportDriverException(
        message,
        MessageImportDriverExceptionCode.NOT_FOUND,
        { cause: options?.cause },
      );

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
