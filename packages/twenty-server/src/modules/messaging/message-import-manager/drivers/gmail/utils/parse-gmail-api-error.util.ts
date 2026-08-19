import { type GaxiosError } from 'gaxios';

import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { parseGmailErrorRetryAfter } from 'src/modules/messaging/message-import-manager/drivers/gmail/utils/parse-gmail-error-retry-after.util';

export const parseGmailApiError = (
  error: GaxiosError,
): MessageImportDriverException => {
  const gmailApiError = {
    code: error.response?.status,
    reason:
      error.response?.data?.error?.errors?.[0].reason ||
      error.response?.data?.error ||
      'Unknown reason',
    message:
      error.response?.data?.error?.errors?.[0].message ||
      error.response?.data?.error_description ||
      'Unknown error',
  };

  if (gmailApiError.code === 400) {
    if (gmailApiError.reason === 'invalid_grant') {
      return new MessageImportDriverException(
        gmailApiError.message,
        MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
      );
    }

    if (
      gmailApiError.reason === 'failedPrecondition' &&
      gmailApiError.message.includes('Mail service not enabled')
    ) {
      return new MessageImportDriverException(
        gmailApiError.message,
        MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
      );
    }

    if (gmailApiError.reason !== 'failedPrecondition') {
      return new MessageImportDriverException(
        gmailApiError.message,
        MessageImportDriverExceptionCode.UNKNOWN,
      );
    }
  }

  if (gmailApiError.code === 404) {
    return new MessageImportDriverException(
      gmailApiError.message,
      MessageImportDriverExceptionCode.SYNC_CURSOR_ERROR,
    );
  }

  if (gmailApiError.code === 429 || gmailApiError.code === 403) {
    return new MessageImportDriverException(
      gmailApiError.message,
      MessageImportDriverExceptionCode.TEMPORARY_ERROR,
      {
        throttleRetryAfter: parseGmailErrorRetryAfter(gmailApiError.message),
      },
    );
  }

  return new MessageImportDriverException(
    gmailApiError.message,
    MessageImportDriverExceptionCode.TEMPORARY_ERROR,
  );
};
