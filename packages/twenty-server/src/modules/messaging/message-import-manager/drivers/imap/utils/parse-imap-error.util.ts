import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { isImapFlowError } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/is-imap-flow-error.util';

export const parseImapError = (
  error: Error,
): MessageImportDriverException | null => {
  if (!error) {
    return null;
  }

  if (!isImapFlowError(error)) {
    return null;
  }

  if (error.code === 'ECONNREFUSED' || error.message === 'Failed to connect') {
    return new MessageImportDriverException(
      `IMAP connection error: ${error.message}`,
      MessageImportDriverExceptionCode.UNKNOWN_NETWORK_ERROR,
    );
  }

  if (error.serverResponseCode) {
    if (error.serverResponseCode === 'AUTHENTICATIONFAILED') {
      return new MessageImportDriverException(
        `IMAP authentication error: ${error.responseText || error.message}`,
        MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
      );
    }

    if (error.serverResponseCode === 'NONEXISTENT') {
      return new MessageImportDriverException(
        `IMAP mailbox not found: ${error.responseText || error.message}`,
        MessageImportDriverExceptionCode.NOT_FOUND,
      );
    }
  }

  if (error.authenticationFailed === true) {
    return new MessageImportDriverException(
      `IMAP authentication error: ${error.responseText || error.message}`,
      MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
    );
  }

  if (error.message === 'Command failed' && error.responseText) {
    if (error.responseText.includes('Resource temporarily unavailable')) {
      return new MessageImportDriverException(
        `IMAP temporary error: ${error.responseText}`,
        MessageImportDriverExceptionCode.TEMPORARY_ERROR,
      );
    }

    return new MessageImportDriverException(
      `IMAP command failed: ${error.responseText}`,
      MessageImportDriverExceptionCode.UNKNOWN,
    );
  }

  return null;
};
