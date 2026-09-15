import { isImapFlowError } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/is-imap-flow-error.util';
import { MISSING_MAILBOX_MESSAGE_PREFIXES } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/missing-mailbox-message-prefixes.const';

export const isImapMailboxNotFoundError = (error: Error): boolean => {
  if (!isImapFlowError(error) || error.responseStatus !== 'NO') {
    return false;
  }

  if (
    error.serverResponseCode?.toUpperCase() === 'NONEXISTENT' ||
    error.mailboxMissing
  ) {
    return true;
  }

  const responseText = error.responseText?.toLowerCase();

  return MISSING_MAILBOX_MESSAGE_PREFIXES.some((prefix) =>
    responseText?.startsWith(prefix),
  );
};
