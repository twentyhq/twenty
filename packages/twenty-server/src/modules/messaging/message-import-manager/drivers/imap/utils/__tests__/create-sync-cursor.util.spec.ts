import { createSyncCursor } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/create-sync-cursor.util';
import { type MailboxState } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/extract-mailbox-state.util';

const mailboxState: MailboxState = {
  uidValidity: 100,
  uidNext: 51,
  maxUid: 50,
  messageCount: 12,
  highestModSeq: BigInt(9),
};

describe('createSyncCursor', () => {
  it('advances the highest UID and stores the message count', () => {
    expect(
      createSyncCursor(
        [41, 47],
        { highestUid: 40, uidValidity: 100, messageCount: 10 },
        mailboxState,
        12,
      ),
    ).toEqual({
      highestUid: 47,
      uidValidity: 100,
      modSeq: '9',
      messageCount: 12,
    });
  });

  it('keeps the previous highest UID when no new message was found', () => {
    expect(
      createSyncCursor(
        [],
        { highestUid: 40, uidValidity: 100, messageCount: 12 },
        mailboxState,
        12,
      ).highestUid,
    ).toBe(40);
  });

  it('omits the message count so the next sync checks for expunged messages again', () => {
    expect(
      createSyncCursor(
        [],
        { highestUid: 40, uidValidity: 100, messageCount: 12 },
        mailboxState,
        undefined,
      ),
    ).not.toHaveProperty('messageCount');
  });
});
