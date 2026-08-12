import { isImapFlowError } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/is-imap-flow-error.util';

export const isImapMailboxNotFoundError = (error: Error): boolean =>
  isImapFlowError(error) &&
  error.responseStatus === 'NO' &&
  (error.serverResponseCode?.toUpperCase() === 'NONEXISTENT' ||
    error.mailboxMissing === true ||
    /^(Mailbox (does not|doesn't) exist|Unknown Mailbox:|No such mailbox)/i.test(
      error.responseText ?? '',
    ));
