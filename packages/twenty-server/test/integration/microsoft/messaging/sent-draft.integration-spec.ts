import { randomUUID } from 'node:crypto';

import {
  ConnectedAccountProvider,
  MessageParticipantRole,
} from 'twenty-shared/types';

import { setupMicrosoftMock } from 'test/integration/microsoft/mocks/setup-microsoft-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { findRecordNodesByFilter } from 'test/integration/utils/find-records-by-filter.util';
import { runMessageChannelSync } from 'test/integration/utils/run-message-channel-sync.util';

const HANDLE = 'microsoft-sent-draft@apple.dev';
const KEPT_RECIPIENT = 'kept-recipient@external.test';
const REMOVED_RECIPIENT = 'removed-recipient@external.test';

const DRAFT_SUBJECT = `Microsoft scheduled message ${randomUUID()}`;
const SENT_SUBJECT = `Microsoft sent message ${randomUUID()}`;

const FOLDERS = [
  { id: 'inbox', displayName: 'Inbox' },
  { id: 'drafts', displayName: 'Drafts' },
  { id: 'sentitems', displayName: 'Sent Items' },
];

const SCHEDULED_MESSAGE_ID = 'microsoft-sent-draft-message';
const SCHEDULED_MESSAGE_HEADER_ID = `<${SCHEDULED_MESSAGE_ID}@example.com>`;

const SCHEDULED_MESSAGE = {
  id: SCHEDULED_MESSAGE_ID,
  subject: DRAFT_SUBJECT,
  body: { contentType: 'text', content: 'Draft body' },
  receivedDateTime: '2026-08-13T00:00:00.000Z',
  internetMessageId: SCHEDULED_MESSAGE_HEADER_ID,
  conversationId: 'microsoft-sent-draft-conversation',
  parentFolderId: 'drafts',
  isDraft: true,
  from: { emailAddress: { address: HANDLE } },
  toRecipients: [
    { emailAddress: { address: KEPT_RECIPIENT } },
    { emailAddress: { address: REMOVED_RECIPIENT } },
  ],
};

type ImportedMessage = {
  id: string;
  subject: string;
  text: string;
  isDraft: boolean;
  messageThreadId: string;
};

type ImportedMessageState = {
  message: ImportedMessage;
  threadSubject: string;
  associations: { id: string; messageExternalId: string }[];
  folderIds: string[];
  recipientHandles: string[];
};

const findImportedMessageState = async (): Promise<ImportedMessageState> => {
  const messages = await findRecordNodesByFilter<ImportedMessage>(
    'message',
    'messages',
    'id subject text isDraft messageThreadId',
    { headerMessageId: { eq: SCHEDULED_MESSAGE_HEADER_ID } },
  );

  expect(messages).toHaveLength(1);

  const [message] = messages;

  const [thread] = await findRecordNodesByFilter<{ subject: string }>(
    'messageThread',
    'messageThreads',
    'subject',
    { id: { eq: message.messageThreadId } },
  );

  const associations = await findRecordNodesByFilter<{
    id: string;
    messageExternalId: string;
  }>(
    'messageChannelMessageAssociation',
    'messageChannelMessageAssociations',
    'id messageExternalId',
    { messageId: { eq: message.id } },
  );

  const folderAssociations = await findRecordNodesByFilter<{
    messageFolderId: string;
  }>(
    'messageChannelMessageAssociationMessageFolder',
    'messageChannelMessageAssociationMessageFolders',
    'messageFolderId',
    {
      messageChannelMessageAssociationId: {
        in: associations.map((association) => association.id),
      },
    },
  );

  const recipients = await findRecordNodesByFilter<{
    handle: string;
    role: string;
  }>('messageParticipant', 'messageParticipants', 'handle role', {
    messageId: { eq: message.id },
  });

  return {
    message,
    threadSubject: thread.subject,
    associations,
    folderIds: folderAssociations.map(
      (folderAssociation) => folderAssociation.messageFolderId,
    ),
    recipientHandles: recipients
      .filter((recipient) => recipient.role === MessageParticipantRole.TO)
      .map((recipient) => recipient.handle)
      .sort(),
  };
};

describe('Microsoft draft sent from Outlook (integration)', () => {
  const microsoftMock = setupMicrosoftMock({
    handle: HANDLE,
    folders: FOLDERS,
    messages: [SCHEDULED_MESSAGE],
  });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;
  let stateWhileScheduled: ImportedMessageState;
  let stateAfterSend: ImportedMessageState;

  beforeAll(async () => {
    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.MICROSOFT,
      handle: HANDLE,
    });

    await runMessageChannelSync(channel.channelId);

    stateWhileScheduled = await findImportedMessageState();

    microsoftMock.moveMessageToFolder(SCHEDULED_MESSAGE_ID, 'sentitems');
    SCHEDULED_MESSAGE.isDraft = false;
    SCHEDULED_MESSAGE.subject = SENT_SUBJECT;
    SCHEDULED_MESSAGE.body = { contentType: 'text', content: 'Sent body' };
    SCHEDULED_MESSAGE.toRecipients = [
      { emailAddress: { address: KEPT_RECIPIENT } },
    ];

    await runMessageChannelSync(channel.channelId);

    stateAfterSend = await findImportedMessageState();
  }, 180000);

  afterAll(async () => {
    await channel?.cleanup().catch(() => undefined);
  });

  it('imports the scheduled message as a draft', () => {
    expect(stateWhileScheduled.message).toMatchObject({
      subject: DRAFT_SUBJECT,
      text: 'Draft body',
      isDraft: true,
    });
    expect(stateWhileScheduled.recipientHandles).toEqual([
      KEPT_RECIPIENT,
      REMOVED_RECIPIENT,
    ]);
    expect(stateWhileScheduled.folderIds).toHaveLength(1);
  });

  it('refreshes the same message record once Outlook sends it', () => {
    expect(stateAfterSend.message).toMatchObject({
      id: stateWhileScheduled.message.id,
      subject: SENT_SUBJECT,
      text: 'Sent body',
      isDraft: false,
    });
    expect(stateAfterSend.associations).toEqual(
      stateWhileScheduled.associations,
    );
  });

  it('keeps only the recipients Outlook still lists', () => {
    expect(stateAfterSend.recipientHandles).toEqual([KEPT_RECIPIENT]);
  });

  it('moves the thread to the sent subject', () => {
    expect(stateAfterSend.threadSubject).toBe(SENT_SUBJECT);
  });

  it('links the message to Sent Items instead of Drafts', () => {
    expect(stateAfterSend.folderIds).toHaveLength(1);
    expect(stateAfterSend.folderIds).not.toEqual(stateWhileScheduled.folderIds);
  });
});
