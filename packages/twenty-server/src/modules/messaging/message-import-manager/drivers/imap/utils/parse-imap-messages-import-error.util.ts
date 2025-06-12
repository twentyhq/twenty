import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { isImapFlowError } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/is-imap-flow-error.util';

export const parseImapMessagesImportError = (
  error: Error,
  messageExternalId: string,
): MessageImportDriverException => {
  if (!error) {
    return new MessageImportDriverException(
      `Unknown IMAP message import error for message ${messageExternalId}: No error provided`,
      MessageImportDriverExceptionCode.UNKNOWN,
    );
  }

  const errorMessage = error.message || '';

  if (!isImapFlowError(error)) {
    return new MessageImportDriverException(
      `Unknown IMAP message import error for message ${messageExternalId}: ${errorMessage}`,
      MessageImportDriverExceptionCode.UNKNOWN,
    );
  }

  if (error.responseText) {
    if (error.responseText.includes('No such message')) {
      return new MessageImportDriverException(
        `IMAP message not found: ${messageExternalId}`,
        MessageImportDriverExceptionCode.NOT_FOUND,
      );
    }

    if (error.responseText.includes('expunged')) {
      return new MessageImportDriverException(
        `IMAP message no longer exists (expunged): ${messageExternalId}`,
        MessageImportDriverExceptionCode.NOT_FOUND,
      );
    }

    if (error.responseText.includes('message size exceeds')) {
      return new MessageImportDriverException(
        `IMAP message fetch error for message ${messageExternalId}: ${error.responseText}`,
        MessageImportDriverExceptionCode.TEMPORARY_ERROR,
      );
    }
  }

  if (
    errorMessage.includes('Message not found') ||
    errorMessage.includes('Invalid sequence set')
  ) {
    return new MessageImportDriverException(
      `IMAP message not found: ${messageExternalId}`,
      MessageImportDriverExceptionCode.NOT_FOUND,
    );
  }

  if (errorMessage.includes('Failed to fetch message')) {
    return new MessageImportDriverException(
      `IMAP message fetch error for message ${messageExternalId}: ${errorMessage}`,
      MessageImportDriverExceptionCode.TEMPORARY_ERROR,
    );
  }

  return new MessageImportDriverException(
    `Unknown IMAP message import error for message ${messageExternalId}: ${errorMessage}`,
    MessageImportDriverExceptionCode.UNKNOWN,
  );
};
