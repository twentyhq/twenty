import {
  ConnectedAccountProvider,
  MessageChannelSyncStage,
  MessageChannelSyncStatus,
} from 'twenty-shared/types';

import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { MESSAGING_THROTTLE_MAX_ATTEMPTS } from 'src/modules/messaging/message-import-manager/constants/messaging-throttle-max-attempts';
import { MessagingMessageListFetchCronJob } from 'src/modules/messaging/message-import-manager/crons/jobs/messaging-message-list-fetch.cron.job';
import { MessagingRelaunchFailedMessageChannelsCronJob } from 'src/modules/messaging/message-import-manager/crons/jobs/messaging-relaunch-failed-message-channels.cron.job';

import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import {
  queryConnectedAccount,
  queryMessageChannel,
  updateMessageChannel,
} from 'test/integration/utils/query-messaging.util';
import { runSyncCron } from 'test/integration/utils/run-sync-cron.util';

const THROTTLED_HANDLE = 'messaging-throttled@apple.dev';
const REVOKED_HANDLE = 'messaging-revoked@apple.dev';

const FUTURE_RETRY_AFTER_ISO = '2099-12-31T10:30:00.000Z';

const ONE_HOUR_AGO = new Date(Date.now() - 60 * 60 * 1000);
const EXPIRED_CREDENTIALS_AT = new Date(Date.now() - 56 * 60 * 1000);

describe('Messaging sync failure lifecycle (integration)', () => {
  const gmail = setupGoogleMock({ handle: THROTTLED_HANDLE });

  let throttledChannel: Awaited<ReturnType<typeof connectMessagingAccount>>;
  let revokedChannel: Awaited<ReturnType<typeof connectMessagingAccount>>;

  beforeAll(async () => {
    throttledChannel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: THROTTLED_HANDLE,
    });

    gmail.actAsAccount(REVOKED_HANDLE);

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
    gmail.rateLimitMessageList(FUTURE_RETRY_AFTER_ISO);

    await runSyncCron(MessagingMessageListFetchCronJob);

    const channelState = await queryMessageChannel(throttledChannel);

    expect(channelState.throttleFailureCount).toBe(1);
    expect(channelState.throttleRetryAfter).toBe(FUTURE_RETRY_AFTER_ISO);
    expect(channelState.syncStatus).not.toBe(
      MessageChannelSyncStatus.FAILED_UNKNOWN,
    );
  }, 60000);

  it('fails the channel as unknown once the throttle attempts are exhausted', async () => {
    gmail.rateLimitMessageList(FUTURE_RETRY_AFTER_ISO);

    const messageChannelRepository =
      getCoreRepository<MessageChannelEntity>(MessageChannelEntity);

    let channelState = await queryMessageChannel(throttledChannel);

    for (
      let attempt = channelState.throttleFailureCount;
      attempt <= MESSAGING_THROTTLE_MAX_ATTEMPTS &&
      channelState.syncStatus !== MessageChannelSyncStatus.FAILED_UNKNOWN;
      attempt++
    ) {
      await messageChannelRepository.update(
        { id: throttledChannel.channelId },
        { syncStageStartedAt: ONE_HOUR_AGO, throttleRetryAfter: null },
      );

      await runSyncCron(MessagingMessageListFetchCronJob);

      channelState = await queryMessageChannel(throttledChannel);
    }

    expect(channelState.syncStatus).toBe(
      MessageChannelSyncStatus.FAILED_UNKNOWN,
    );
    expect(channelState.syncStage).toBe(MessageChannelSyncStage.FAILED);
  }, 120000);

  it('fails the channel as insufficient-permissions when the refresh token is declined', async () => {
    gmail.actAsAccount(REVOKED_HANDLE);

    await updateMessageChannel(revokedChannel.channelId, {
      isSyncEnabled: true,
    });

    await getCoreRepository<ConnectedAccountEntity>(
      ConnectedAccountEntity,
    ).update(
      { id: revokedChannel.connectedAccountId },
      { lastCredentialsRefreshedAt: EXPIRED_CREDENTIALS_AT },
    );

    gmail.declineTokenRefresh();

    await runSyncCron(MessagingMessageListFetchCronJob);

    const channelState = await queryMessageChannel(revokedChannel);

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
    await runSyncCron(MessagingRelaunchFailedMessageChannelsCronJob);

    const relaunchedChannel = await queryMessageChannel(throttledChannel);

    expect(relaunchedChannel.syncStatus).toBe(MessageChannelSyncStatus.ACTIVE);
    expect(relaunchedChannel.syncStage).toBe(
      MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
    );
    expect(relaunchedChannel.throttleFailureCount).toBe(0);
    expect(relaunchedChannel.throttleRetryAfter).toBeNull();
    expect(relaunchedChannel.syncStageStartedAt).toBeNull();

    const untouchedChannel = await queryMessageChannel(revokedChannel);

    expect(untouchedChannel.syncStatus).toBe(
      MessageChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS,
    );
    expect(untouchedChannel.syncStage).toBe(MessageChannelSyncStage.FAILED);
  }, 60000);
});
