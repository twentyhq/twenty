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
  declinedGoogleTokenRefresh,
  googleAccountIdentityHandlers,
} from 'test/integration/messaging/utils/google-auth-mock.util';
import {
  rateLimitedGmailMessageList,
  setupGmailMock,
} from 'test/integration/messaging/utils/gmail-message-mock.util';
import {
  queryConnectedAccount,
  queryMessageChannel,
  updateMessageChannel,
} from 'test/integration/messaging/utils/query-messaging.util';
import { enqueueJob } from 'test/integration/utils/enqueue-job.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { pollUntil } from 'test/integration/utils/poll-until.util';

const THROTTLED_HANDLE = 'messaging-throttled@apple.dev';
const REVOKED_HANDLE = 'messaging-revoked@apple.dev';

// Must be in the future: the parser discards elapsed retry-after windows.
const RETRY_AFTER_ISO = '2099-12-31T10:30:00.000Z';

const ONE_HOUR_IN_MS = 60 * 60 * 1000;
const EXPIRED_CREDENTIALS_AT = new Date(Date.now() - 56 * 60 * 1000);

describe('Messaging sync failure lifecycle (integration)', () => {
  const gmail = setupGmailMock({ inbox: [], handle: THROTTLED_HANDLE });
  const messageChannelRepository =
    getCoreRepository<MessageChannelEntity>(MessageChannelEntity);
  const connectedAccountRepository = getCoreRepository<ConnectedAccountEntity>(
    ConnectedAccountEntity,
  );

  let throttledChannel: Awaited<ReturnType<typeof connectMessagingAccount>>;
  let revokedChannel: Awaited<ReturnType<typeof connectMessagingAccount>>;

  const runSyncCycle = () =>
    enqueueJob(MessageQueue.cronQueue, MessagingMessageListFetchCronJob, {});

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
    messageChannelRepository.update(
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

    await Promise.all([
      pollUntil(
        getThrottledChannel,
        (state) =>
          state.syncStage ===
          MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
      ),
      pollUntil(
        getRevokedChannel,
        (state) =>
          state.syncStage ===
          MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
      ),
    ]);

    await updateMessageChannel(revokedChannel.channelId, {
      isSyncEnabled: false,
    });
  }, 120000);

  afterAll(async () => {
    await Promise.all([throttledChannel.cleanup(), revokedChannel.cleanup()]);
  });

  it('records the throttle backoff on a 429 and keeps the channel alive', async () => {
    gmail.use(rateLimitedGmailMessageList(RETRY_AFTER_ISO));

    await runSyncCycle();

    const channelState = await pollUntil(
      getThrottledChannel,
      (state) => state.throttleRetryAfter !== null,
    );

    expect(channelState.throttleFailureCount).toBe(1);
    expect(channelState.throttleRetryAfter).toBe(RETRY_AFTER_ISO);
    expect(channelState.syncStatus).not.toBe(
      MessageChannelSyncStatus.FAILED_UNKNOWN,
    );
  }, 60000);

  it('fails the channel as unknown once the throttle attempts are exhausted', async () => {
    gmail.use(rateLimitedGmailMessageList(RETRY_AFTER_ISO));

    let channelState = await getThrottledChannel();

    for (
      let attempt = channelState.throttleFailureCount;
      attempt <= MESSAGING_THROTTLE_MAX_ATTEMPTS &&
      channelState.syncStatus !== MessageChannelSyncStatus.FAILED_UNKNOWN;
      attempt++
    ) {
      const previousFailureCount = channelState.throttleFailureCount;

      await expireThrottleBackoff();

      await runSyncCycle();

      channelState = await pollUntil(
        getThrottledChannel,
        (state) =>
          state.syncStatus === MessageChannelSyncStatus.FAILED_UNKNOWN ||
          state.throttleFailureCount > previousFailureCount,
      );
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

    await connectedAccountRepository.update(
      { id: revokedChannel.connectedAccountId },
      { lastCredentialsRefreshedAt: EXPIRED_CREDENTIALS_AT },
    );

    gmail.use(declinedGoogleTokenRefresh());

    await runSyncCycle();

    const channelState = await pollUntil(
      getRevokedChannel,
      (state) =>
        state.syncStatus ===
        MessageChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS,
    );

    expect(channelState.syncStage).toBe(MessageChannelSyncStage.FAILED);

    const account = await queryConnectedAccount(
      revokedChannel.connectedAccountId,
    );

    expect(account.authFailedAt).not.toBeNull();
  }, 60000);

  it('relaunches the unknown-failure channel and leaves the permissions-failure channel untouched', async () => {
    await enqueueJob(
      MessageQueue.cronQueue,
      MessagingRelaunchFailedMessageChannelsCronJob,
      {},
    );

    const relaunchedChannel = await pollUntil(
      getThrottledChannel,
      (state) => state.syncStatus === MessageChannelSyncStatus.ACTIVE,
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
