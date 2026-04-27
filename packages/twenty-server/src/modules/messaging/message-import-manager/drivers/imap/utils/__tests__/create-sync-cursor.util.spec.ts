import { createSyncCursor } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/create-sync-cursor.util';
import { type ImapSyncCursor } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/parse-sync-cursor.util';
import { type MailboxState } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/extract-mailbox-state.util';

describe('createSyncCursor', () => {
  const mailboxState: MailboxState = {
    uidValidity: 12345,
    uidNext: 1000,
    maxUid: 999,
    highestModSeq: BigInt(5000),
  };

  it('creates initial cursor with firstSyncedUid', () => {
    const messageUids = [10, 11, 12];
    const cursor = createSyncCursor(messageUids, null, mailboxState);

    expect(cursor).toEqual({
      highestUid: '12',
      uidValidity: '12345',
      modSeq: '5000',
      firstSyncedUid: '10',
    });
  });

  it('maintains firstSyncedUid in subsequent syncs', () => {
    const previousCursor: ImapSyncCursor = {
      highestUid: '12',
      uidValidity: '12345',
      modSeq: '5000',
      firstSyncedUid: '10',
    };

    const newMessageUids = [13, 14];
    const cursor = createSyncCursor(newMessageUids, previousCursor, mailboxState);

    expect(cursor).toEqual({
      highestUid: '14',
      uidValidity: '12345',
      modSeq: '5000',
      firstSyncedUid: '10',
    });
  });

  it('updates highestUid strictly monotonically', () => {
    const previousCursor: ImapSyncCursor = {
      highestUid: '12',
      uidValidity: '12345',
      modSeq: '5000',
    };

    const newMessageUids = [11, 10]; // Out of order UIDs or modified messages
    const cursor = createSyncCursor(newMessageUids, previousCursor, mailboxState);

    expect(cursor.highestUid).toBe('12');
  });

  it('handles empty message list correctly', () => {
    const previousCursor: ImapSyncCursor = {
      highestUid: '12',
      uidValidity: '12345',
      modSeq: '5000',
      firstSyncedUid: '10',
    };

    const cursor = createSyncCursor([], previousCursor, mailboxState);

    expect(cursor).toEqual({
      highestUid: '12',
      uidValidity: '12345',
      modSeq: '5000',
      firstSyncedUid: '10',
    });
  });
});
