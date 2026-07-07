import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { gmailMessage } from 'test/integration/google/mocks/gmail-message.util';
import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import {
  findRecordIdsByFilter,
  findRecordNodesByFilter,
} from 'test/integration/utils/find-records-by-filter.util';
import { deleteConnectedAccount } from 'test/integration/utils/query-messaging.util';
import { runMessageChannelSync } from 'test/integration/utils/run-message-channel-sync.util';

const HANDLE = 'messaging-cleanup@apple.dev';

describe('Messaging connected account cleanup (integration)', () => {
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

  it('deletes all associated messaging data when the connected account is removed', async () => {
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

    expect(
      await findRecordIdsByFilter(
        'messageChannelMessageAssociationMessageFolder',
        'messageChannelMessageAssociationMessageFolders',
        { messageChannelMessageAssociationId: { in: associationIds } },
      ),
    ).not.toHaveLength(0);
    expect(
      await findRecordIdsByFilter('messageParticipant', 'messageParticipants', {
        messageId: { in: messageIds },
      }),
    ).not.toHaveLength(0);
    expect(
      await findRecordIdsByFilter('messageThread', 'messageThreads', {
        id: { in: threadIds },
      }),
    ).not.toHaveLength(0);

    await deleteConnectedAccount(channel.connectedAccountId);

    expect(
      await findRecordIdsByFilter('message', 'messages', {
        id: { in: messageIds },
      }),
    ).toHaveLength(0);
    expect(
      await findRecordIdsByFilter(
        'messageChannelMessageAssociation',
        'messageChannelMessageAssociations',
        { messageChannelId: { eq: channel.channelId } },
      ),
    ).toHaveLength(0);
    expect(
      await findRecordIdsByFilter(
        'messageChannelMessageAssociationMessageFolder',
        'messageChannelMessageAssociationMessageFolders',
        { messageChannelMessageAssociationId: { in: associationIds } },
      ),
    ).toHaveLength(0);
    expect(
      await findRecordIdsByFilter('messageParticipant', 'messageParticipants', {
        messageId: { in: messageIds },
      }),
    ).toHaveLength(0);
    expect(
      await findRecordIdsByFilter('messageThread', 'messageThreads', {
        id: { in: threadIds },
      }),
    ).toHaveLength(0);
  }, 60000);
});
