import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { connectMessagingAccount } from 'test/integration/messaging/utils/connect-messaging-account.util';
import {
  gmailMessage,
  setupGmailMock,
} from 'test/integration/messaging/utils/gmail-message-mock.util';
import { deleteConnectedAccount } from 'test/integration/messaging/utils/query-messaging.util';
import {
  findRecordIdsByFilter,
  findRecordNodesByFilter,
} from 'test/integration/utils/find-records-by-filter.util';
import { runMessageChannelSync } from 'test/integration/utils/run-channel-sync.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';

const HANDLE = 'messaging-cleanup@apple.dev';

describe('Messaging connected account cleanup (integration)', () => {
  const inbox = [gmailMessage(), gmailMessage()];

  setupGmailMock({ inbox, handle: HANDLE });

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
    await waitForAllJobsToFinish();

    const [
      remainingMessages,
      remainingAssociations,
      remainingFolders,
      remainingParticipants,
      remainingThreads,
    ] = await Promise.all([
      findRecordIdsByFilter('message', 'messages', {
        id: { in: messageIds },
      }),
      findRecordIdsByFilter(
        'messageChannelMessageAssociation',
        'messageChannelMessageAssociations',
        { messageChannelId: { eq: channel.channelId } },
      ),
      findRecordIdsByFilter(
        'messageChannelMessageAssociationMessageFolder',
        'messageChannelMessageAssociationMessageFolders',
        { messageChannelMessageAssociationId: { in: associationIds } },
      ),
      findRecordIdsByFilter('messageParticipant', 'messageParticipants', {
        messageId: { in: messageIds },
      }),
      findRecordIdsByFilter('messageThread', 'messageThreads', {
        id: { in: threadIds },
      }),
    ]);

    expect(remainingMessages).toHaveLength(0);
    expect(remainingAssociations).toHaveLength(0);
    expect(remainingFolders).toHaveLength(0);
    expect(remainingParticipants).toHaveLength(0);
    expect(remainingThreads).toHaveLength(0);
  }, 60000);
});
