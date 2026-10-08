import { randomUUID } from 'node:crypto';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { setupMicrosoftMock } from 'test/integration/microsoft/mocks/setup-microsoft-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { findImportedMessageSubjects } from 'test/integration/utils/find-imported-records.util';
import { runMessageChannelSync } from 'test/integration/utils/run-message-channel-sync.util';

const HANDLE = 'microsoft-cross-folder-move@apple.dev';

const MOVED_SUBJECT = `Microsoft moved message ${randomUUID()}`;
const DELETED_SUBJECT = `Microsoft deleted message ${randomUUID()}`;

const FOLDERS = [
  { id: 'inbox', displayName: 'Inbox' },
  { id: 'sentitems', displayName: 'Sent Items' },
  { id: 'archive', displayName: 'Archive' },
];

const inboxMessage = (id: string, subject: string) => ({
  id,
  subject,
  body: { contentType: 'text', content: subject },
  receivedDateTime: '2026-08-13T00:00:00.000Z',
  internetMessageId: `<${id}@example.com>`,
  conversationId: `${id}-conversation`,
  parentFolderId: 'inbox',
  isDraft: false,
  from: { emailAddress: { address: 'sender@external.test' } },
  toRecipients: [{ emailAddress: { address: HANDLE } }],
});

const MOVED_MESSAGE = inboxMessage(
  'microsoft-cross-folder-moved-message',
  MOVED_SUBJECT,
);
const DELETED_MESSAGE = inboxMessage(
  'microsoft-cross-folder-deleted-message',
  DELETED_SUBJECT,
);

describe('Microsoft cross-folder move (integration)', () => {
  const microsoftMock = setupMicrosoftMock({
    handle: HANDLE,
    folders: FOLDERS,
    messages: [MOVED_MESSAGE, DELETED_MESSAGE],
  });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;
  let subjectsAfterInitialSync: string[];
  let subjectsAfterMoveAndDelete: string[];

  beforeAll(async () => {
    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.MICROSOFT,
      handle: HANDLE,
    });

    await runMessageChannelSync(channel.channelId);

    subjectsAfterInitialSync = await findImportedMessageSubjects([
      MOVED_SUBJECT,
      DELETED_SUBJECT,
    ]);

    microsoftMock.moveMessageToFolder(MOVED_MESSAGE.id, 'archive');
    microsoftMock.deleteMessage(DELETED_MESSAGE.id);

    await runMessageChannelSync(channel.channelId);

    subjectsAfterMoveAndDelete = await findImportedMessageSubjects([
      MOVED_SUBJECT,
      DELETED_SUBJECT,
    ]);
  }, 180000);

  afterAll(async () => {
    await channel?.cleanup().catch(() => undefined);
  });

  it('imports both inbox messages on the first sync', () => {
    expect(subjectsAfterInitialSync).toEqual(
      [MOVED_SUBJECT, DELETED_SUBJECT].sort(),
    );
  });

  it('keeps the moved message the archive delta still returns and deletes the one no folder returns', () => {
    expect(subjectsAfterMoveAndDelete).toEqual([MOVED_SUBJECT]);
  });
});
