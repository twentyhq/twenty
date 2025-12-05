import { type ImapFlow } from 'imapflow';

import { type MailboxState } from './extract-mailbox-state.util';
import { type ImapSyncCursor } from './parse-sync-cursor.util';

export const canUseQresync = (
  client: ImapFlow,
  previousCursor: ImapSyncCursor | null,
  mailboxState: MailboxState,
): boolean => {
  const supportsQresync = client.capabilities.has('QRESYNC');
  const hasModSeq = previousCursor?.modSeq !== undefined;
  const hasServerModSeq = mailboxState.highestModSeq !== undefined;
  const uidValidityMatches =
    (previousCursor?.uidValidity ?? 0) === mailboxState.uidValidity ||
    previousCursor?.uidValidity === 0;

  return supportsQresync && hasModSeq && hasServerModSeq && uidValidityMatches;
};
