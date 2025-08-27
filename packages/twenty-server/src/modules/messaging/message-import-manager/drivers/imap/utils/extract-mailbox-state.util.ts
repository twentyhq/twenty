import { type ImapFlow } from 'imapflow';

export type MailboxState = {
  uidValidity: number;
  uidNext: number;
  maxUid: number;
  highestModSeq?: bigint;
};

export const extractMailboxState = (
  mailbox: NonNullable<ImapFlow['mailbox']>,
): MailboxState => {
  if (typeof mailbox === 'boolean') {
    throw new Error('Invalid mailbox state');
  }

  const uidNext = Number(mailbox.uidNext ?? 1);

  return {
    uidValidity: Number(mailbox.uidValidity ?? 0),
    uidNext,
    maxUid: Math.max(0, uidNext - 1),
    highestModSeq: mailbox.highestModseq,
  };
};
