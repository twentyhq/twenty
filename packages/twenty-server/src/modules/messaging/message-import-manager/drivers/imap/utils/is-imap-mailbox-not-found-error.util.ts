import { isImapFlowError } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/is-imap-flow-error.util';

export const isImapMailboxNotFoundError = (error: Error): boolean => {
  if (!isImapFlowError(error)) {
    return false;
  }

  if (error.serverResponseCode === 'NONEXISTENT') {
    return true;
  }

  const responseText = error.responseText ?? '';

  return (
    responseText.includes('Mailbox does not exist') ||
    responseText.includes("Mailbox doesn't exist")
  );
};
