import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { gmailMessage } from 'test/integration/google/mocks/gmail-message.util';
import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import {
  findRecordIdsByFilter,
  findRecordNodesByFilter,
} from 'test/integration/utils/find-records-by-filter.util';
import {
  disconnectConnectedAccount,
  queryConnectedAccounts,
} from 'test/integration/utils/query-messaging.util';
import { runMessageChannelSync } from 'test/integration/utils/run-message-channel-sync.util';

const HANDLE = 'messaging-disconnect@apple.dev';

describe('Messaging connected account disconnect (integration)', () => {
  const inbox = [gmailMessage(), gmailMessage()];

  setupGoogleMock({ handle: HANDLE, inbox });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;

  beforeAll(async () => {
    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: HANDLE,
    });

    await runMessageChannelSync(channel.channelId);
  }, 60000);

  afterAll(async () => {
    await channel?.cleanup().catch(() => undefined);
  });

  it('keeps all associated messaging data when the connected account is disconnected', async () => {
    const associations = await findRecordNodesByFilter<{
      id: string;
      messageId: string;
    }>(
      'messageChannelMessageAssociation',
      'messageChannelMessageAssociations',
      `id
        messageId`,
      { messageChannelId: { eq: channel.channelId } },
    );

    expect(associations).toHaveLength(inbox.length);

    const associationIds = associations.map((association) => association.id);
    const messageIds = associations.map((association) => association.messageId);

    const messages = await findRecordNodesByFilter<{
      id: string;
      messageThreadId: string | null;
    }>(
      'message',
      'messages',
      `id
        messageThreadId`,
      { id: { in: messageIds } },
    );

    expect(messages).toHaveLength(inbox.length);

    const threadIds = [
      ...new Set(messages.map((message) => message.messageThreadId)),
    ].filter(isDefined);

    const folderIdsBefore = await findRecordIdsByFilter(
      'messageChannelMessageAssociationMessageFolder',
      'messageChannelMessageAssociationMessageFolders',
      { messageChannelMessageAssociationId: { in: associationIds } },
    );
    const participantIdsBefore = await findRecordIdsByFilter(
      'messageParticipant',
      'messageParticipants',
      { messageId: { in: messageIds } },
    );

    expect(folderIdsBefore).not.toHaveLength(0);
    expect(participantIdsBefore).not.toHaveLength(0);

    await disconnectConnectedAccount(channel.connectedAccountId);

    expect(
      await findRecordIdsByFilter('message', 'messages', {
        id: { in: messageIds },
      }),
    ).toHaveLength(messageIds.length);
    expect(
      await findRecordIdsByFilter(
        'messageChannelMessageAssociation',
        'messageChannelMessageAssociations',
        { messageChannelId: { eq: channel.channelId } },
      ),
    ).toHaveLength(associationIds.length);
    expect(
      await findRecordIdsByFilter(
        'messageChannelMessageAssociationMessageFolder',
        'messageChannelMessageAssociationMessageFolders',
        { messageChannelMessageAssociationId: { in: associationIds } },
      ),
    ).toHaveLength(folderIdsBefore.length);
    expect(
      await findRecordIdsByFilter('messageParticipant', 'messageParticipants', {
        messageId: { in: messageIds },
      }),
    ).toHaveLength(participantIdsBefore.length);
    expect(
      await findRecordIdsByFilter('messageThread', 'messageThreads', {
        id: { in: threadIds },
      }),
    ).toHaveLength(threadIds.length);
  }, 60000);

  it('removes the disconnected account from the accounts list', async () => {
    const accountIds = (await queryConnectedAccounts()).map(
      (account) => account.id,
    );

    expect(accountIds).not.toContain(channel.connectedAccountId);
  }, 60000);
});
