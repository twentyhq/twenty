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

  const isTrackingLiveUids = isDefined(currentLiveUids);
  const boundedLiveUids =
    isTrackingLiveUids && currentLiveUids.length > 1000
      ? currentLiveUids.slice(-1000)
      : currentLiveUids;

  return {
    highestUid,
    uidValidity,
    ...(highestModSeq ? { modSeq: highestModSeq.toString() } : {}),
    ...(isTrackingLiveUids ? { knownUids: boundedLiveUids } : {}),
    ...(isTrackingLiveUids ? { messageCount: currentLiveUids.length } : {}),
  };
};
