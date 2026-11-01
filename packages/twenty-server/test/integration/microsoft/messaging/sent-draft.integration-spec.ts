import { randomUUID } from 'node:crypto';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { setupMicrosoftMock } from 'test/integration/microsoft/mocks/setup-microsoft-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { findRecordNodesByFilter } from 'test/integration/utils/find-records-by-filter.util';
import { runMessageChannelSync } from 'test/integration/utils/run-message-channel-sync.util';

const HANDLE = 'microsoft-sent-draft@apple.dev';

const SUBJECT = `Microsoft scheduled message ${randomUUID()}`;

const FOLDERS = [
  { id: 'inbox', displayName: 'Inbox' },
  { id: 'drafts', displayName: 'Drafts' },
  { id: 'sentitems', displayName: 'Sent Items' },
];

const SCHEDULED_MESSAGE_ID = 'microsoft-sent-draft-message';

const SCHEDULED_MESSAGE: Record<string, unknown> = {
  id: SCHEDULED_MESSAGE_ID,
  subject: SUBJECT,
  body: { contentType: 'text', content: 'Draft body' },
  receivedDateTime: '2026-08-13T00:00:00.000Z',
  internetMessageId: '<microsoft-sent-draft-message@example.com>',
  conversationId: 'microsoft-sent-draft-conversation',
  parentFolderId: 'drafts',
  isDraft: true,
  from: { emailAddress: { address: HANDLE } },
  toRecipients: [{ emailAddress: { address: 'recipient@external.test' } }],
};

type ImportedMessage = { text: string; isDraft: boolean };

const findImportedMessages = () =>
  findRecordNodesByFilter<ImportedMessage>(
    'message',
    'messages',
    'text isDraft',
    { subject: { eq: SUBJECT } },
  );

describe('Microsoft draft sent from Outlook (integration)', () => {
  const microsoftMock = setupMicrosoftMock({
    handle: HANDLE,
    folders: FOLDERS,
    messages: [SCHEDULED_MESSAGE],
  });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;
  let messagesWhileScheduled: ImportedMessage[];
  let messagesAfterSend: ImportedMessage[];

  beforeAll(async () => {
    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.MICROSOFT,
      handle: HANDLE,
    });

    await runMessageChannelSync(channel.channelId);

    messagesWhileScheduled = await findImportedMessages();

    microsoftMock.moveMessageToFolder(SCHEDULED_MESSAGE_ID, 'sentitems');
    SCHEDULED_MESSAGE.isDraft = false;
    SCHEDULED_MESSAGE.body = { contentType: 'text', content: 'Sent body' };

    await runMessageChannelSync(channel.channelId);

    messagesAfterSend = await findImportedMessages();
  }, 180000);

  afterAll(async () => {
    await channel?.cleanup().catch(() => undefined);
  });

  it('imports the scheduled message as a draft', () => {
    expect(messagesWhileScheduled).toEqual([
      expect.objectContaining({ text: 'Draft body', isDraft: true }),
    ]);
  });

  it('turns the same message into a sent message once Outlook sends it', () => {
    expect(messagesAfterSend).toEqual([
      expect.objectContaining({ text: 'Sent body', isDraft: false }),
    ]);
  });
});
