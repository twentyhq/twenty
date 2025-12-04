import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { MessageNetworkExceptionCode } from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-network.exception';
import { isImapFlowError } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/is-imap-flow-error.util';

export const parseImapError = (
  error: Error,
  options?: { cause?: Error },
): MessageImportDriverException | null => {
  if (!error) {
    return null;
  }

  if (!isImapFlowError(error)) {
    return null;
  }

  if (error.message.includes('Connection not available')) {
    return new MessageImportDriverException(
      `IMAP client not available: ${error.message}`,
      MessageImportDriverExceptionCode.TEMPORARY_ERROR,
      { cause: options?.cause || error },
    );
  }

  if (error.message.includes('timeout')) {
    return new MessageImportDriverException(
      `IMAP connection timeout: ${error.message}`,
      MessageNetworkExceptionCode.ETIMEDOUT,
      { cause: options?.cause || error },
    );
  }

  if (error.code === 'ECONNREFUSED' || error.message === 'Failed to connect') {
    return new MessageImportDriverException(
      `IMAP connection error: ${error.message}`,
      MessageImportDriverExceptionCode.UNKNOWN_NETWORK_ERROR,
      { cause: options?.cause || error },
    );
  }

  if (error.serverResponseCode) {
    if (error.serverResponseCode === 'AUTHENTICATIONFAILED') {
      return new MessageImportDriverException(
        `IMAP authentication error: ${error.responseText || error.message}`,
        MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
        { cause: options?.cause || error },
      );
    }

    if (error.serverResponseCode === 'NONEXISTENT') {
      return new MessageImportDriverException(
        `IMAP mailbox not found: ${error.responseText || error.message}`,
        MessageImportDriverExceptionCode.NOT_FOUND,
        { cause: options?.cause || error },
      );
    }
  }

  if (error.authenticationFailed === true) {
    return new MessageImportDriverException(
      `IMAP authentication error: ${error.responseText || error.message}`,
      MessageImportDriverExceptionCode.INSUFFICIENT_PERMISSIONS,
      { cause: options?.cause || error },
    );
  }

  if (error.message === 'Command failed') {
    if (error.responseText) {
      if (error.responseText.includes('Resource temporarily unavailable')) {
        return new MessageImportDriverException(
          `IMAP temporary error: ${error.responseText}`,
          MessageImportDriverExceptionCode.TEMPORARY_ERROR,
          { cause: options?.cause || error },
        );
      }

      return new MessageImportDriverException(
        `IMAP command failed: ${error.responseText}`,
        MessageImportDriverExceptionCode.UNKNOWN,
        { cause: options?.cause || error },
      );
    }

    return new MessageImportDriverException(
      `IMAP command failed: ${error.message}`,
      MessageImportDriverExceptionCode.TEMPORARY_ERROR,
      { cause: options?.cause || error },
    );
  }

  return null;
};
