import {
  ConnectedAccountProvider,
  MessageChannelSyncStage,
  MessageChannelSyncStatus,
} from 'twenty-shared/types';

import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { MESSAGING_THROTTLE_MAX_ATTEMPTS } from 'src/modules/messaging/message-import-manager/constants/messaging-throttle-max-attempts';
import { MessagingMessageListFetchCronJob } from 'src/modules/messaging/message-import-manager/crons/jobs/messaging-message-list-fetch.cron.job';
import { MessagingRelaunchFailedMessageChannelsCronJob } from 'src/modules/messaging/message-import-manager/crons/jobs/messaging-relaunch-failed-message-channels.cron.job';

import { connectMessagingAccount } from 'test/integration/messaging/utils/connect-messaging-account.util';
import {
  rateLimitedGmailMessageList,
  setupGmailMock,
} from 'test/integration/messaging/utils/gmail-message-mock.util';
import {
  declinedGoogleTokenRefresh,
  googleAccountIdentityHandlers,
} from 'test/integration/messaging/utils/google-auth-mock.util';
import {
  queryConnectedAccount,
  queryMessageChannel,
  updateMessageChannel,
} from 'test/integration/messaging/utils/query-messaging.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { runQueueJobAndWaitForCompletion } from 'test/integration/utils/run-queue-job.util';

const THROTTLED_HANDLE = 'messaging-throttled@apple.dev';
const REVOKED_HANDLE = 'messaging-revoked@apple.dev';

const FUTURE_RETRY_AFTER_ISO = '2099-12-31T10:30:00.000Z';

const ONE_HOUR_IN_MS = 60 * 60 * 1000;
const EXPIRED_CREDENTIALS_AT = new Date(Date.now() - 56 * 60 * 1000);

describe('Messaging sync failure lifecycle (integration)', () => {
  const gmail = setupGmailMock({ inbox: [], handle: THROTTLED_HANDLE });

  let throttledChannel: Awaited<ReturnType<typeof connectMessagingAccount>>;
  let revokedChannel: Awaited<ReturnType<typeof connectMessagingAccount>>;

  const runSyncCycle = () =>
    runQueueJobAndWaitForCompletion(
      MessageQueue.cronQueue,
      MessagingMessageListFetchCronJob.name,
      {},
    );

  const getThrottledChannel = () =>
    queryMessageChannel(
      throttledChannel.connectedAccountId,
      throttledChannel.channelId,
    );

  const getRevokedChannel = () =>
    queryMessageChannel(
      revokedChannel.connectedAccountId,
      revokedChannel.channelId,
    );

  const expireThrottleBackoff = () =>
    getCoreRepository<MessageChannelEntity>(MessageChannelEntity).update(
      { id: throttledChannel.channelId },
      {
        syncStageStartedAt: new Date(Date.now() - ONE_HOUR_IN_MS),
        throttleRetryAfter: null,
      },
    );

  beforeAll(async () => {
    throttledChannel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: THROTTLED_HANDLE,
    });

    gmail.use(...googleAccountIdentityHandlers(REVOKED_HANDLE));

    revokedChannel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: REVOKED_HANDLE,
    });

    await updateMessageChannel(revokedChannel.channelId, {
      isSyncEnabled: false,
    });
  }, 120000);

  afterAll(async () => {
    await throttledChannel?.cleanup().catch(() => undefined);
    await revokedChannel?.cleanup().catch(() => undefined);
  });

  it('records the throttle backoff on a 429 and keeps the channel alive', async () => {
    gmail.use(rateLimitedGmailMessageList(FUTURE_RETRY_AFTER_ISO));

    await runSyncCycle();

    const channelState = await getThrottledChannel();

    expect(channelState.throttleFailureCount).toBe(1);
    expect(channelState.throttleRetryAfter).toBe(FUTURE_RETRY_AFTER_ISO);
    expect(channelState.syncStatus).not.toBe(
      MessageChannelSyncStatus.FAILED_UNKNOWN,
    );
  }, 60000);

  it('fails the channel as unknown once the throttle attempts are exhausted', async () => {
    gmail.use(rateLimitedGmailMessageList(FUTURE_RETRY_AFTER_ISO));

    let channelState = await getThrottledChannel();

    for (
      let attempt = channelState.throttleFailureCount;
      attempt <= MESSAGING_THROTTLE_MAX_ATTEMPTS &&
      channelState.syncStatus !== MessageChannelSyncStatus.FAILED_UNKNOWN;
      attempt++
    ) {
      await expireThrottleBackoff();

      await runSyncCycle();

      channelState = await getThrottledChannel();
    }

    expect(channelState.syncStatus).toBe(
      MessageChannelSyncStatus.FAILED_UNKNOWN,
    );
    expect(channelState.syncStage).toBe(MessageChannelSyncStage.FAILED);
  }, 120000);

  it('fails the channel as insufficient-permissions when the refresh token is declined', async () => {
    await updateMessageChannel(revokedChannel.channelId, {
      isSyncEnabled: true,
    });

    await getCoreRepository<ConnectedAccountEntity>(
      ConnectedAccountEntity,
    ).update(
      { id: revokedChannel.connectedAccountId },
      { lastCredentialsRefreshedAt: EXPIRED_CREDENTIALS_AT },
    );

    gmail.use(declinedGoogleTokenRefresh());

    await runSyncCycle();

    const channelState = await getRevokedChannel();

    expect(channelState.syncStatus).toBe(
      MessageChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS,
    );
    expect(channelState.syncStage).toBe(MessageChannelSyncStage.FAILED);

    const account = await queryConnectedAccount(
      revokedChannel.connectedAccountId,
    );

    expect(account.authFailedAt).not.toBeNull();
  }, 60000);

  it('relaunches the unknown-failure channel and leaves the permissions-failure channel untouched', async () => {
    await runQueueJobAndWaitForCompletion(
      MessageQueue.cronQueue,
      MessagingRelaunchFailedMessageChannelsCronJob.name,
      {},
    );

    const relaunchedChannel = await getThrottledChannel();

    expect(relaunchedChannel.syncStatus).toBe(
      MessageChannelSyncStatus.ACTIVE,
    );
    expect(relaunchedChannel.syncStage).toBe(
      MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
    );
    expect(relaunchedChannel.throttleFailureCount).toBe(0);
    expect(relaunchedChannel.throttleRetryAfter).toBeNull();
    expect(relaunchedChannel.syncStageStartedAt).toBeNull();

    const untouchedChannel = await getRevokedChannel();

    expect(untouchedChannel.syncStatus).toBe(
      MessageChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS,
    );
    expect(untouchedChannel.syncStage).toBe(MessageChannelSyncStage.FAILED);
  }, 60000);
});
