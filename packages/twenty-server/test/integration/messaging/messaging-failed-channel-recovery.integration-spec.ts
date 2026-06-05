import {
  MessageChannelSyncStage,
  MessageChannelSyncStatus,
} from 'twenty-shared/types';

import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { MessagingRelaunchFailedMessageChannelJob } from 'src/modules/messaging/message-import-manager/jobs/messaging-relaunch-failed-message-channel.job';
import { getMessageChannel } from 'test/integration/messaging/utils/get-message-channel.util';
import { seedMessageChannel } from 'test/integration/messaging/utils/seed-message-channel.util';
import { enqueueJobAndAwait } from 'test/integration/utils/enqueue-job-and-await.util';

const WORKSPACE_ID = SEED_APPLE_WORKSPACE_ID;

const relaunchFailedChannel = (channelId: string) =>
  enqueueJobAndAwait(
    MessageQueue.messagingQueue,
    MessagingRelaunchFailedMessageChannelJob,
    { workspaceId: WORKSPACE_ID, messageChannelId: channelId },
  );

describe('Messaging failed-channel recovery (integration)', () => {
  it('recovers a FAILED_UNKNOWN channel and clears its throttle state', async () => {
    const channel = await seedMessageChannel({
      workspaceId: WORKSPACE_ID,
      syncStage: MessageChannelSyncStage.FAILED,
      syncStatus: MessageChannelSyncStatus.FAILED_UNKNOWN,
      throttleFailureCount: 3,
      throttleRetryAfter: new Date(Date.now() + 60_000),
      syncStageStartedAt: new Date(),
    });

    try {
      await relaunchFailedChannel(channel.channelId);

      const recovered = await getMessageChannel(channel.channelId);

      expect(recovered.syncStage).toBe(
        MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
      );
      expect(recovered.syncStatus).toBe(MessageChannelSyncStatus.ACTIVE);
      expect(recovered.throttleFailureCount).toBe(0);
      expect(recovered.throttleRetryAfter).toBeNull();
      expect(recovered.syncStageStartedAt).toBeNull();
    } finally {
      await channel.cleanup();
    }
  }, 60000);

  it('leaves a FAILED_INSUFFICIENT_PERMISSIONS channel untouched', async () => {
    const channel = await seedMessageChannel({
      workspaceId: WORKSPACE_ID,
      syncStage: MessageChannelSyncStage.FAILED,
      syncStatus: MessageChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS,
    });

    try {
      await relaunchFailedChannel(channel.channelId);

      const channelAfter = await getMessageChannel(channel.channelId);

      expect(channelAfter.syncStage).toBe(MessageChannelSyncStage.FAILED);
      expect(channelAfter.syncStatus).toBe(
        MessageChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS,
      );
    } finally {
      await channel.cleanup();
    }
  }, 60000);
});
