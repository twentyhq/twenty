import { type MailboxState } from './extract-mailbox-state.util';
import { type ImapSyncCursor } from './parse-sync-cursor.util';

export const createSyncCursor = (
  messageUids: number[],
  previousCursor: ImapSyncCursor | null,
  mailboxState: MailboxState,
): ImapSyncCursor => {
  const { uidValidity, highestModSeq } = mailboxState;
  const lastSeenUid = previousCursor?.highestUid ?? 0;
  const firstSyncedUid =
    previousCursor?.firstSyncedUid ??
    (messageUids.length > 0 ? Math.min(...messageUids) : undefined);

  let highestUid = lastSeenUid;

  for (let i = 0; i < messageUids.length; i++) {
    const uid = Number(messageUids[i]);

    if (uid > highestUid) {
      highestUid = uid;
    }
  }

  return {
    highestUid,
    uidValidity,
    ...(highestModSeq ? { modSeq: highestModSeq.toString() } : {}),
    ...(firstSyncedUid !== undefined ? { firstSyncedUid } : {}),
  };
};
