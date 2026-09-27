import { isDefined } from 'twenty-shared/utils';

import { type MailboxState } from './extract-mailbox-state.util';
import { type ImapSyncCursor } from './parse-sync-cursor.util';

export const createSyncCursor = (
  messageUids: number[],
  previousCursor: ImapSyncCursor | null,
  mailboxState: MailboxState,
  currentLiveUids?: number[],
): ImapSyncCursor => {
  const { uidValidity, highestModSeq } = mailboxState;
  const lastSeenUid = previousCursor?.highestUid ?? 0;

  let highestUid = lastSeenUid;

  for (let i = 0; i < messageUids.length; i++) {
    if (messageUids[i] > highestUid) {
      highestUid = messageUids[i];
    }
  }

  // Preserve numeric 0 for empty mailboxes to avoid omitting messageCount due to falsiness (Issue #26099)
  const resolvedMessageCount = isDefined(currentLiveUids)
    ? currentLiveUids.length
    : mailboxState.messageCount;

  return {
    highestUid,
    uidValidity,
    ...(highestModSeq ? { modSeq: highestModSeq.toString() } : {}),
    ...(isDefined(currentLiveUids) ? { knownUids: currentLiveUids } : {}),
    ...(isDefined(resolvedMessageCount)
      ? { messageCount: resolvedMessageCount }
      : {}),
  };
};
