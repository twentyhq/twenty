import { ConnectedAccountProvider } from 'twenty-shared/types';

import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessagingMessageListFetchCronJob } from 'src/modules/messaging/message-import-manager/crons/jobs/messaging-message-list-fetch.cron.job';
import { connectMessagingAccount } from 'test/integration/messaging/utils/connect-messaging-account.util';
import { findRecordIdsByFilter } from 'test/integration/messaging/utils/find-records-by-filter.util';
import {
  getGmailMessageSubject,
  gmailMessage,
  setupGmailMock,
} from 'test/integration/messaging/utils/gmail-message-mock.util';
import { deleteConnectedAccount } from 'test/integration/messaging/utils/query-messaging.util';
import { enqueueJob } from 'test/integration/utils/enqueue-job.util';
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

    await enqueueJob(
      MessageQueue.cronQueue,
      MessagingMessageListFetchCronJob,
      {},
    );

    const expectedSubjects = inbox.map(getGmailMessageSubject);

    await pollUntil(
      () =>
        findRecordIdsByFilter('message', 'messages', {
          messageChannelMessageAssociations: {
            messageChannelId: { eq: channel.channelId },
          },
        }),
      (ids) => ids.length === expectedSubjects.length,
    );
  }, 60000);

  it('deletes all associated messaging data when the connected account is removed', async () => {
    expect(
      await findRecordIdsByFilter(
        'messageChannelMessageAssociation',
        'messageChannelMessageAssociations',
        { messageChannelId: { eq: channel.channelId } },
      ),
    ).not.toHaveLength(0);
    expect(
      await findRecordIdsByFilter(
        'messageChannelMessageAssociationMessageFolder',
        'messageChannelMessageAssociationMessageFolders',
        {
          messageChannelMessageAssociation: {
            messageChannelId: { eq: channel.channelId },
          },
        },
      ),
    ).not.toHaveLength(0);
    expect(
      await findRecordIdsByFilter('messageParticipant', 'messageParticipants', {
        message: {
          messageChannelMessageAssociations: {
            messageChannelId: { eq: channel.channelId },
          },
        },
      }),
    ).not.toHaveLength(0);
    expect(
      await findRecordIdsByFilter('messageThread', 'messageThreads', {
        messages: {
          messageChannelMessageAssociations: {
            messageChannelId: { eq: channel.channelId },
          },
        },
      }),
    ).not.toHaveLength(0);

    await deleteConnectedAccount(channel.connectedAccountId);

    expect(
      await findRecordIdsByFilter('message', 'messages', {
        messageChannelMessageAssociations: {
          messageChannelId: { eq: channel.channelId },
        },
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
        {
          messageChannelMessageAssociation: {
            messageChannelId: { eq: channel.channelId },
          },
        },
      ),
    ).toHaveLength(0);
    expect(
      await findRecordIdsByFilter('messageParticipant', 'messageParticipants', {
        message: {
          messageChannelMessageAssociations: {
            messageChannelId: { eq: channel.channelId },
          },
        },
      }),
    ).toHaveLength(0);
    expect(
      await findRecordIdsByFilter('messageThread', 'messageThreads', {
        messages: {
          messageChannelMessageAssociations: {
            messageChannelId: { eq: channel.channelId },
          },
        },
      }),
    ).toHaveLength(0);
  }, 60000);
});
