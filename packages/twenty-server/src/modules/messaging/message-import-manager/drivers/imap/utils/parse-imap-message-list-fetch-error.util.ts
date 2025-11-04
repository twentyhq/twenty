import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { isImapFlowError } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/is-imap-flow-error.util';

export const parseImapMessageListFetchError = (
  error: Error,
  options?: { cause?: Error },
): MessageImportDriverException => {
  if (!error) {
    return new MessageImportDriverException(
      'Unknown IMAP message list fetch error: No error provided',
      MessageImportDriverExceptionCode.UNKNOWN,
      { cause: options?.cause },
    );
  }

  const errorMessage = error.message || '';

  if (!isImapFlowError(error)) {
    return new MessageImportDriverException(
      `Unknown IMAP message list fetch error: ${errorMessage}`,
      MessageImportDriverExceptionCode.UNKNOWN,
      { cause: options?.cause || error },
    );
  }

  if (error.responseText) {
    if (
      error.responseText.includes('Invalid search') ||
      error.responseText.includes('invalid sequence set')
    ) {
      return new MessageImportDriverException(
        `IMAP sync cursor error: ${error.responseText}`,
        MessageImportDriverExceptionCode.SYNC_CURSOR_ERROR,
        { cause: options?.cause || error },
      );
    }

    if (error.responseText.includes('No matching messages')) {
      return new MessageImportDriverException(
        'No messages found for next sync cursor',
        MessageImportDriverExceptionCode.NO_NEXT_SYNC_CURSOR,
        { cause: options?.cause || error },
      );
    }
  }

  if (errorMessage.includes('Invalid sequence set')) {
    return new MessageImportDriverException(
      `IMAP sync cursor error: ${errorMessage}`,
      MessageImportDriverExceptionCode.SYNC_CURSOR_ERROR,
      { cause: options?.cause || error },
    );
  }

  if (errorMessage.includes('No messages found')) {
    return new MessageImportDriverException(
      'No messages found for next sync cursor',
      MessageImportDriverExceptionCode.NO_NEXT_SYNC_CURSOR,
      { cause: options?.cause || error },
    );
  }

  return new MessageImportDriverException(
    `Unknown IMAP message list fetch error: code: ${error.code} | responseText: ${error.responseText} | executedCommand: ${error.executedCommand}`,
    MessageImportDriverExceptionCode.UNKNOWN,
    { cause: options?.cause || error },
  );
};
