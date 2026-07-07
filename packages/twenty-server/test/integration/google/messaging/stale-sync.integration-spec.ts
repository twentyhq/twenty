import {
  ConnectedAccountProvider,
  MessageChannelSyncStage,
} from 'twenty-shared/types';

import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { MessagingOngoingStaleCronJob } from 'src/modules/messaging/message-import-manager/crons/jobs/messaging-ongoing-stale.cron.job';

import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { queryMessageChannel } from 'test/integration/utils/query-messaging.util';
import { runSyncCron } from 'test/integration/utils/run-sync-cron.util';

const STALE_HANDLE = 'messaging-stale-sync@apple.dev';
const RECENT_HANDLE = 'messaging-recent-sync@apple.dev';

const STALE_STARTED_AT = new Date(Date.now() - 31 * 60 * 1000);
const RECENT_STARTED_AT = new Date(Date.now() - 60 * 1000);

describe('Messaging stale-sync recovery (integration)', () => {
  const gmail = setupGoogleMock({ handle: STALE_HANDLE });

  let staleChannel: Awaited<ReturnType<typeof connectMessagingAccount>>;
  let recentChannel: Awaited<ReturnType<typeof connectMessagingAccount>>;

  beforeAll(async () => {
    staleChannel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: STALE_HANDLE,
    });

    gmail.actAsAccount(RECENT_HANDLE);

    recentChannel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: RECENT_HANDLE,
    });

    for (const connectedChannel of [staleChannel, recentChannel]) {
      const channelState = await queryMessageChannel(connectedChannel);

      expect(channelState.syncStage).toBe(
        MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
      );
    }
  }, 120000);

  afterAll(async () => {
    await staleChannel?.cleanup().catch(() => undefined);
    await recentChannel?.cleanup().catch(() => undefined);
  });

  it('resets a stale ongoing channel to pending and leaves a recent one running', async () => {
    const messageChannelRepository =
      getCoreRepository<MessageChannelEntity>(MessageChannelEntity);

    await messageChannelRepository.update(
      { id: staleChannel.channelId },
      {
        syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_ONGOING,
        syncStageStartedAt: STALE_STARTED_AT,
      },
    );

    await messageChannelRepository.update(
      { id: recentChannel.channelId },
      {
        syncStage: MessageChannelSyncStage.MESSAGE_LIST_FETCH_ONGOING,
        syncStageStartedAt: RECENT_STARTED_AT,
      },
    );

    await runSyncCron(MessagingOngoingStaleCronJob);

    const staleChannelAfter = await queryMessageChannel(staleChannel);

    expect(staleChannelAfter.syncStage).toBe(
      MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
    );
    expect(staleChannelAfter.syncStageStartedAt).toBeNull();

    const recentChannelAfter = await queryMessageChannel(recentChannel);

    expect(recentChannelAfter.syncStage).toBe(
      MessageChannelSyncStage.MESSAGE_LIST_FETCH_ONGOING,
    );
  }, 60000);
});
