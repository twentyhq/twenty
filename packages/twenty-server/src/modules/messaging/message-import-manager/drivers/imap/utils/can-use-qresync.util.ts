import { type MailboxState } from './extract-mailbox-state.util';
import { type ImapSyncCursor } from './parse-sync-cursor.util';

export const canUseQresync = (
  supportsQresync: boolean,
  previousCursor: ImapSyncCursor | null,
  mailboxState: MailboxState,
): boolean => {
  const lastModSeq = previousCursor?.modSeq
    ? BigInt(previousCursor.modSeq)
    : undefined;
  const lastUidValidity = previousCursor?.uidValidity ?? 0;
  const { uidValidity, highestModSeq } = mailboxState;

  return (
    supportsQresync &&
    lastModSeq !== undefined &&
    highestModSeq !== undefined &&
    lastUidValidity === uidValidity
  );
};
