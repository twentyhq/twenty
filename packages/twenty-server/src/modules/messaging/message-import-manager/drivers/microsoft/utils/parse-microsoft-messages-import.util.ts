import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';

export const parseMicrosoftMessagesImportError = (error: {
  statusCode: number;
  message?: string;
  code?: string;
}): MessageImportDriverException | undefined => {
  if (error.statusCode === 401) {
    return new MessageImportDriverException(
      'Unauthorized access to Microsoft Graph API',
      MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
    );
  }

  if (error.statusCode === 403) {
    return new MessageImportDriverException(
      'Forbidden access to Microsoft Graph API',
      MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
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
      );
    } else {
      return new MessageImportDriverException(
        `Not found - code:${error.code}`,
        MessageImportDriverExceptionCode.NOT_FOUND,
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
    );
  }

  return undefined;
};
