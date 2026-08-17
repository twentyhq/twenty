import { randomUUID } from 'node:crypto';

import {
  ConnectedAccountProvider,
  MessageChannelSyncStage,
  MessageChannelSyncStatus,
  MessageChannelType,
} from 'twenty-shared/types';

import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { MessagingRelaunchFailedMessageChannelsCronJob } from 'src/modules/messaging/message-import-manager/crons/jobs/messaging-relaunch-failed-message-channels.cron.job';

import { setupGoogleMock } from 'test/integration/google/mocks/setup-google-mock.util';
import { connectMessagingAccount } from 'test/integration/utils/connect-messaging-account.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { runSyncCron } from 'test/integration/utils/run-sync-cron.util';

const HANDLE = 'gmail-email-group-exclusion@apple.dev';

describe('Email group channel sync exclusion (integration)', () => {
  setupGoogleMock({ handle: HANDLE });

  const messageChannelRepository =
    getCoreRepository<MessageChannelEntity>(MessageChannelEntity);

  let channel: Awaited<ReturnType<typeof connectMessagingAccount>>;
  let emailGroupChannelId: string;

  const readChannel = (id: string) =>
    messageChannelRepository.findOneByOrFail({ id });

  const failChannel = (id: string) =>
    messageChannelRepository.update(
      { id },
      {
        syncStatus: MessageChannelSyncStatus.FAILED_UNKNOWN,
        syncStage: MessageChannelSyncStage.FAILED,
        throttleFailureCount: 3,
      },
    );

  beforeAll(async () => {
    channel = await connectMessagingAccount({
      provider: ConnectedAccountProvider.GOOGLE,
      handle: HANDLE,
    });

    const emailChannel = await readChannel(channel.channelId);

    // Cloned so columns added to the channel later do not break this insert.
    const { id: _id, ...emailChannelColumns } = emailChannel;

    const emailGroupChannel = await messageChannelRepository.save({
      ...emailChannelColumns,
      handle: `group-${randomUUID()}@apple.dev`,
      type: MessageChannelType.EMAIL_GROUP,
      isSyncEnabled: true,
    });

    emailGroupChannelId = emailGroupChannel.id;
  }, 60000);

  afterAll(async () => {
    await messageChannelRepository
      .delete({ id: emailGroupChannelId })
      .catch(() => undefined);
    await channel?.cleanup().catch(() => undefined);
  });

  it('relaunches a failed email channel but never a failed email group channel', async () => {
    await failChannel(channel.channelId);
    await failChannel(emailGroupChannelId);

    await runSyncCron(MessagingRelaunchFailedMessageChannelsCronJob);

    const relaunchedChannel = await readChannel(channel.channelId);

    expect(relaunchedChannel.syncStatus).toBe(MessageChannelSyncStatus.ACTIVE);
    expect(relaunchedChannel.syncStage).toBe(
      MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
    );
    expect(relaunchedChannel.throttleFailureCount).toBe(0);

    const untouchedGroupChannel = await readChannel(emailGroupChannelId);

    expect(untouchedGroupChannel.syncStatus).toBe(
      MessageChannelSyncStatus.FAILED_UNKNOWN,
    );
    expect(untouchedGroupChannel.syncStage).toBe(
      MessageChannelSyncStage.FAILED,
    );
    expect(untouchedGroupChannel.throttleFailureCount).toBe(3);
  }, 120000);
});
