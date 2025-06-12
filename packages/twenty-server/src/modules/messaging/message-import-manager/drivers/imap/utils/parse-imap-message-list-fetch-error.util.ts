import {
  MessageImportDriverException,
  MessageImportDriverExceptionCode,
} from 'src/modules/messaging/message-import-manager/drivers/exceptions/message-import-driver.exception';
import { ImapFlowError } from 'src/modules/messaging/message-import-manager/drivers/imap/types/imap-error.type';

export const parseImapMessageListFetchError = (
  error: Error,
): MessageImportDriverException => {
  if (!error) {
    return new MessageImportDriverException(
      'Unknown IMAP message list fetch error: No error provided',
      MessageImportDriverExceptionCode.UNKNOWN,
    );
  }

  const errorObj = error as ImapFlowError;
  const errorMessage = error.message || '';

  if (errorObj.responseText) {
    if (
      errorObj.responseText.includes('Invalid search') ||
      errorObj.responseText.includes('invalid sequence set')
    ) {
      return new MessageImportDriverException(
        `IMAP sync cursor error: ${errorObj.responseText}`,
        MessageImportDriverExceptionCode.SYNC_CURSOR_ERROR,
      );
    }

    if (errorObj.responseText.includes('No matching messages')) {
      return new MessageImportDriverException(
        'No messages found for next sync cursor',
        MessageImportDriverExceptionCode.NO_NEXT_SYNC_CURSOR,
      );
    }
  }

  if (errorMessage.includes('Invalid sequence set')) {
    return new MessageImportDriverException(
      `IMAP sync cursor error: ${errorMessage}`,
      MessageImportDriverExceptionCode.SYNC_CURSOR_ERROR,
    );
  }

  if (errorMessage.includes('No messages found')) {
    return new MessageImportDriverException(
      'No messages found for next sync cursor',
      MessageImportDriverExceptionCode.NO_NEXT_SYNC_CURSOR,
    );
  }

  return new MessageImportDriverException(
    `Unknown IMAP message list fetch error: ${errorMessage}`,
    MessageImportDriverExceptionCode.UNKNOWN,
  );
};
