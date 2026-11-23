import {
  ConnectedAccountProvider,
  MessageParticipantRole,
} from 'twenty-shared/types';
import { In } from 'typeorm';

import { MessageFolderEntity } from 'src/engine/metadata-modules/message-folder/entities/message-folder.entity';

import { setupMicrosoftMock } from 'test/integration/microsoft/mocks/setup-microsoft-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { findRecordNodesByFilter } from 'test/integration/utils/find-records-by-filter.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { runMessageChannelSync } from 'test/integration/utils/run-message-channel-sync.util';

const HANDLE = 'microsoft-sent-draft@apple.dev';
const KEPT_RECIPIENT = 'kept-recipient@external.test';
const REMOVED_RECIPIENT = 'removed-recipient@external.test';

const FOLDERS = [
  { id: 'inbox', displayName: 'Inbox' },
  { id: 'drafts', displayName: 'Drafts' },
  { id: 'sentitems', displayName: 'Sent Items' },
  { id: 'archive', displayName: 'Archive' },
];

const RECEIVED_MESSAGE = {
  id: 'microsoft-received-message',
  subject: 'Received message',
  body: { contentType: 'text', content: 'Received body' },
  receivedDateTime: '2026-08-12T00:00:00.000Z',
  internetMessageId: '<microsoft-received-message@example.com>',
  conversationId: 'microsoft-received-conversation',
  parentFolderId: 'inbox',
  isDraft: false,
  from: { emailAddress: { address: KEPT_RECIPIENT, name: 'Kept Recipient' } },
  toRecipients: [{ emailAddress: { address: HANDLE } }],
};

const DRAFT_MESSAGE = {
  id: 'microsoft-sent-draft-message',
  subject: 'Draft message',
  body: { contentType: 'text', content: 'Draft body' },
  receivedDateTime: '2026-08-13T00:00:00.000Z',
  internetMessageId: '<microsoft-sent-draft-message@example.com>',
  conversationId: 'microsoft-sent-draft-conversation',
  parentFolderId: 'drafts',
  isDraft: true,
  from: { emailAddress: { address: HANDLE } },
  toRecipients: [
    { emailAddress: { address: KEPT_RECIPIENT } },
    { emailAddress: { address: REMOVED_RECIPIENT } },
  ],
};

const findMessageState = async (headerMessageId: string) => {
  const [message] = await findRecordNodesByFilter<{
    id: string;
    text: string;
    isDraft: boolean;
  }>('message', 'messages', 'id text isDraft', {
    headerMessageId: { eq: headerMessageId },
  });

  const associations = await findRecordNodesByFilter<{ id: string }>(
    'messageChannelMessageAssociation',
    'messageChannelMessageAssociations',
    'id',
    { messageId: { eq: message.id } },
  );

  const folderLinks = await findRecordNodesByFilter<{
    messageFolderId: string;
  }>(
    'messageChannelMessageAssociationMessageFolder',
    'messageChannelMessageAssociationMessageFolders',
    'messageFolderId',
    {
      messageChannelMessageAssociationId: {
        in: associations.map(({ id }) => id),
      },
    },
  );

  const folders = await getCoreRepository<MessageFolderEntity>(
    MessageFolderEntity,
  ).findBy({
    id: In(folderLinks.map(({ messageFolderId }) => messageFolderId)),
  });

  const participants = await findRecordNodesByFilter<{
    id: string;
    handle: string;
    role: string;
  }>('messageParticipant', 'messageParticipants', 'id handle role', {
    messageId: { eq: message.id },
  });

  return {
    message,
    folderExternalIds: folders.map(({ externalId }) => externalId),
    participantIds: participants.map(({ id }) => id).sort(),
    recipientHandles: participants
      .filter(({ role }) => role === MessageParticipantRole.TO)
      .map(({ handle }) => handle)
      .sort(),
  };
};

describe('Microsoft folder moves (integration)', () => {
  const microsoftMock = setupMicrosoftMock({
    handle: HANDLE,
    folders: FOLDERS,
    messages: [DRAFT_MESSAGE, RECEIVED_MESSAGE],
  });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;
  let draftBefore: Awaited<ReturnType<typeof findMessageState>>;
  let draftAfter: Awaited<ReturnType<typeof findMessageState>>;
  let receivedBefore: Awaited<ReturnType<typeof findMessageState>>;
  let receivedAfter: Awaited<ReturnType<typeof findMessageState>>;

  beforeAll(async () => {
    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.MICROSOFT,
      handle: HANDLE,
    });

    await runMessageChannelSync(channel.channelId);

    draftBefore = await findMessageState(DRAFT_MESSAGE.internetMessageId);
    receivedBefore = await findMessageState(RECEIVED_MESSAGE.internetMessageId);

    microsoftMock.moveMessageToFolder(DRAFT_MESSAGE.id, 'sentitems');
    DRAFT_MESSAGE.isDraft = false;
    DRAFT_MESSAGE.body = { contentType: 'text', content: 'Sent body' };
    DRAFT_MESSAGE.toRecipients = [
      { emailAddress: { address: KEPT_RECIPIENT } },
    ];

    microsoftMock.moveMessageToFolder(RECEIVED_MESSAGE.id, 'archive');
    RECEIVED_MESSAGE.from.emailAddress.name = 'Renamed Recipient';

    await runMessageChannelSync(channel.channelId);

    draftAfter = await findMessageState(DRAFT_MESSAGE.internetMessageId);
    receivedAfter = await findMessageState(RECEIVED_MESSAGE.internetMessageId);
  }, 180000);

  afterAll(async () => {
    await channel?.cleanup().catch(() => undefined);
  });

  it('refreshes a draft that Outlook sent', () => {
    expect(draftBefore.message.isDraft).toBe(true);
    expect(draftAfter.message).toEqual({
      id: draftBefore.message.id,
      text: 'Sent body',
      isDraft: false,
    });
    expect(draftAfter.recipientHandles).toEqual([KEPT_RECIPIENT]);
    expect(draftAfter.folderExternalIds).toEqual(['sentitems']);
  });

  it('only updates the folder links of a moved email', () => {
    expect(receivedAfter.folderExternalIds).toEqual(['archive']);
    expect(receivedAfter.participantIds).toEqual(receivedBefore.participantIds);
  });
});
