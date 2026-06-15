import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { connectMessagingAccount } from 'test/integration/messaging/utils/connect-messaging-account.util';
import {
  findRecordIdsByFilter,
  findRecordNodesByFilter,
} from 'test/integration/messaging/utils/find-records-by-filter.util';
import {
  getGmailMessageSubject,
  gmailMessage,
  setupGmailMock,
} from 'test/integration/messaging/utils/gmail-message-mock.util';
import { deleteConnectedAccount } from 'test/integration/messaging/utils/query-messaging.util';
import { runMessageChannelSync } from 'test/integration/utils/run-channel-sync.util';
import { pollUntil } from 'test/integration/utils/poll-until.util';

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

    const expectedSubjects = inbox.map(getGmailMessageSubject);

    await pollUntil(
      () =>
        findRecordIdsByFilter(
          'messageChannelMessageAssociation',
          'messageChannelMessageAssociations',
          { messageChannelId: { eq: channel.channelId } },
        ),
      (ids) => ids.length === expectedSubjects.length,
    );
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

    expect(associations).not.toHaveLength(0);

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

    expect(messages).not.toHaveLength(0);

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

    await pollUntil(
      async () => {
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

        return (
          remainingMessages.length +
          remainingAssociations.length +
          remainingFolders.length +
          remainingParticipants.length +
          remainingThreads.length
        );
      },
      (remaining) => remaining === 0,
    );
  }, 60000);
});
