import { type ImapFlow } from 'imapflow';
import { isDefined } from 'twenty-shared/utils';

export type MailboxState = {
  uidValidity: number;
  uidNext: number;
  maxUid: number;
  highestModSeq?: bigint;
};

// David.fx and other non-RFC servers omit the required UIDNEXT on SELECT;
// fall back to STATUS, then the highest live UID, so the sync range isn't empty.
const resolveUidNext = async (
  client: ImapFlow,
  folderPath: string,
  mailboxUidNext: number | undefined,
): Promise<number> => {
  if (isDefined(mailboxUidNext)) {
    return Number(mailboxUidNext);
  }

  const status = await client.status(folderPath, { uidNext: true });
  const statusUidNext = Number(status.uidNext ?? 0);

  if (statusUidNext > 0) {
    return statusUidNext;
  }

  const uids = await client.search({ uid: '1:*' }, { uid: true });
  const highestUid = Array.isArray(uids)
    ? uids.reduce((max, uid) => (uid > max ? uid : max), 0)
    : 0;

  return highestUid + 1;
};

export const resolveMailboxState = async (
  client: ImapFlow,
  folderPath: string,
  mailbox: NonNullable<ImapFlow['mailbox']>,
): Promise<MailboxState> => {
  if (typeof mailbox === 'boolean') {
    throw new Error('Invalid mailbox state');
  }

  const uidNext = await resolveUidNext(client, folderPath, mailbox.uidNext);

  return {
    uidValidity: Number(mailbox.uidValidity ?? 0),
    uidNext,
    maxUid: Math.max(0, uidNext - 1),
    highestModSeq: mailbox.highestModseq,
  };
};
