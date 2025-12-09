import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';

export const parseMicrosoftMessagesImportError = (
  error: {
    statusCode: number;
    message?: string;
    code?: string;
  },
  options?: { cause?: Error },
): MessageImportDriverException => {
  if (error.statusCode === 401) {
    return new MessageImportDriverException(
      'Unauthorized access to Microsoft Graph API',
      MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
      { cause: options?.cause },
    );
  }

  if (error.statusCode === 403) {
    return new MessageImportDriverException(
      'Forbidden access to Microsoft Graph API',
      MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
      { cause: options?.cause },
    );
  }

  if (error.statusCode === 404) {
    if (
      error.message?.includes(
        'The mailbox is either inactive, soft-deleted, or is hosted on-premise.',
      )
    ) {
      return new MessageImportDriverException(
        `Disabled, deleted, inactive or no licence Microsoft account - code:${error.code}`,
        MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
        { cause: options?.cause },
      );
    } else {
      return new MessageImportDriverException(
        `Not found - code:${error.code}`,
        MessageImportDriverExceptionCode.NOT_FOUND,
        { cause: options?.cause },
      );
    }
  }

  if (
    error.statusCode === 429 ||
    error.statusCode === 503 ||
    error.statusCode === 509
  ) {
    return new MessageImportDriverException(
      `Microsoft Graph API ${error.code} ${error.statusCode} error: ${error.message}`,
      MessageImportDriverExceptionCode.TEMPORARY_ERROR,
      { cause: options?.cause },
    );
  }

  if (error.statusCode === 410) {
    return new MessageImportDriverException(
      `Sync cursor error: ${error.message}`,
      MessageImportDriverExceptionCode.SYNC_CURSOR_ERROR,
      { cause: options?.cause },
    );
  }

  return new MessageImportDriverException(
    `Microsoft Graph API unknown error: ${error} with status code ${error.statusCode}`,
    MessageImportDriverExceptionCode.UNKNOWN,
    { cause: options?.cause },
  );
};
