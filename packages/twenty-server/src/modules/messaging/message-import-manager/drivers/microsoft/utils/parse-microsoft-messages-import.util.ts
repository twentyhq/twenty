import { MICROSOFT_PERMANENT_ACCOUNT_ERROR_CODES } from 'src/modules/connected-account/constants/microsoft-permanent-account-error-codes.constant';
import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { isDefined } from 'twenty-shared/utils';

export const parseMicrosoftMessagesImportError = (
  error: {
    statusCode: number;
    message?: string;
    code?: string;
  },
  options?: { cause?: Error },
): MessageImportDriverException => {
  if (
    isDefined(error.code) &&
    MICROSOFT_PERMANENT_ACCOUNT_ERROR_CODES.includes(error.code)
  ) {
    return new MessageImportDriverException(
      `Disabled, deleted, unlicensed or inaccessible Microsoft account - code:${error.code}`,
      MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
      { cause: options?.cause },
    );
  }

  if (error.statusCode === 400 && isDefined(error.message)) {
    return new MessageImportDriverException(
      `Invalid request to Microsoft Graph API: ${error.message}`,
      MessageImportDriverExceptionCode.UNKNOWN,
      { cause: options?.cause },
    );
  }

  if (error.statusCode === 404) {
    return new MessageImportDriverException(
      `Not found - code:${error.code}`,
      MessageImportDriverExceptionCode.NOT_FOUND,
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
    `Microsoft Graph API ${error.code} ${error.statusCode} error: ${error.message}`,
    MessageImportDriverExceptionCode.TEMPORARY_ERROR,
    { cause: options?.cause },
  );
};
