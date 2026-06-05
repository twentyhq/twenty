import {
  ConnectedAccountProvider,
  MessageChannelSyncStage,
} from 'twenty-shared/types';

import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessagingMessageListFetchCronJob } from 'src/modules/messaging/message-import-manager/crons/jobs/messaging-message-list-fetch.cron.job';
import { connectMessagingAccount } from 'test/integration/messaging/utils/connect-messaging-account.util';
import {
  gmailMessage,
  setupGmailMock,
} from 'test/integration/messaging/utils/gmail-message-mock.util';
import {
  queryConnectedAccount,
  queryMessageChannel,
} from 'test/integration/messaging/utils/query-messaging.util';
import { enqueueJob } from 'test/integration/utils/enqueue-job.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { pollUntil } from 'test/integration/utils/poll-until.util';

const HANDLE = 'messaging-token-refresh@apple.dev';

// Older than the 55-minute access-token validity window, so the next sync refreshes.
const EXPIRED_CREDENTIALS_AT = new Date(Date.now() - 56 * 60 * 1000);

describe('Messaging token refresh (integration)', () => {
  setupGmailMock({ inbox: [gmailMessage()], handle: HANDLE });

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;

  beforeAll(async () => {
    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: HANDLE,
    });
  }, 60000);

  afterAll(async () => {
    await channel.cleanup();
  });

  it('refreshes expired credentials and completes the sync', async () => {
    await pollUntil(
      () => queryMessageChannel(channel.connectedAccountId, channel.channelId),
      (channelState) =>
        channelState.syncStage ===
        MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
    );

    await getCoreRepository<ConnectedAccountEntity>(
      ConnectedAccountEntity,
    ).update(
      { id: channel.connectedAccountId },
      { lastCredentialsRefreshedAt: EXPIRED_CREDENTIALS_AT },
    );

    await enqueueJob(
      MessageQueue.cronQueue,
      MessagingMessageListFetchCronJob,
      {},
    );

    const account = await pollUntil(
      () => queryConnectedAccount(channel.connectedAccountId),
      (accountState) =>
        new Date(accountState.lastCredentialsRefreshedAt ?? 0).getTime() >
        EXPIRED_CREDENTIALS_AT.getTime(),
    );

    expect(account.authFailedAt).toBeNull();
    expect(
      new Date(account.lastCredentialsRefreshedAt ?? 0).getTime(),
    ).toBeGreaterThan(EXPIRED_CREDENTIALS_AT.getTime());
  }, 60000);
});
