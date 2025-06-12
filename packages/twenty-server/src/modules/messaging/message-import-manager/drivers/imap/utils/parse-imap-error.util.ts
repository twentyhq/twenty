import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { ImapFlowError } from 'src/modules/messaging/message-import-manager/drivers/imap/types/imap-error.type';

export const parseImapError = (
  error: Error,
): MessageImportDriverException | null => {
  if (!error) {
    return null;
  }

  const errorObj = error as ImapFlowError;

  if (
    errorObj.code === 'ECONNREFUSED' ||
    error.message === 'Failed to connect'
  ) {
    return new MessageImportDriverException(
      `IMAP connection error: ${error.message}`,
      MessageImportDriverExceptionCode.UNKNOWN_NETWORK_ERROR,
    );
  }

  if (errorObj.serverResponseCode) {
    if (errorObj.serverResponseCode === 'AUTHENTICATIONFAILED') {
      return new MessageImportDriverException(
        `IMAP authentication error: ${errorObj.responseText || error.message}`,
        MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
      );
    }

    if (errorObj.serverResponseCode === 'NONEXISTENT') {
      return new MessageImportDriverException(
        `IMAP mailbox not found: ${errorObj.responseText || error.message}`,
        MessageImportDriverExceptionCode.NOT_FOUND,
      );
    }
  }

  if (errorObj.authenticationFailed === true) {
    return new MessageImportDriverException(
      `IMAP authentication error: ${errorObj.responseText || error.message}`,
      MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
    );
  }

  if (error.message === 'Command failed' && errorObj.responseText) {
    if (errorObj.responseText.includes('Resource temporarily unavailable')) {
      return new MessageImportDriverException(
        `IMAP temporary error: ${errorObj.responseText}`,
        MessageImportDriverExceptionCode.TEMPORARY_ERROR,
      );
    }

    return new MessageImportDriverException(
      `IMAP command failed: ${errorObj.responseText}`,
      MessageImportDriverExceptionCode.UNKNOWN,
    );
  }

  return null;
};
