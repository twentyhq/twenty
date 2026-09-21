import { MessageChannelSyncStage } from 'twenty-shared/types';

import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { MessagingMessageWebhookSyncJob } from 'src/modules/connected-account-sync-webhooks/messaging-message-webhook-sync/jobs/messaging-message-webhook-sync.job';

import { enqueueJobAndDrain } from 'test/integration/utils/enqueue-job-and-drain.util';
import { scheduleChannelStage } from 'test/integration/utils/schedule-channel-stage.util';

export const runMessageChannelWebhookSync = async (
  messageChannelId: string,
  startingStage: MessageChannelSyncStage = MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
): Promise<void> => {
  const workspaceId = await scheduleChannelStage(
    MessageChannelEntity,
    messageChannelId,
    startingStage,
  );

  await enqueueJobAndDrain(
    MessageQueue.connectedAccountSyncWebhookQueue,
    MessagingMessageWebhookSyncJob.name,
    { workspaceId, messageChannelId },
  );
};
