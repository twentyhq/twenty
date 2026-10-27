import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { MessageChannelSyncStage } from 'twenty-shared/types';

import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { MessagingMessageListFetchJob } from 'src/modules/messaging/message-import-manager/jobs/messaging-message-list-fetch.job';

import { enqueueJobAndDrain } from 'test/integration/utils/enqueue-job-and-drain.util';
import { scheduleChannelStage } from 'test/integration/utils/schedule-channel-stage.util';

export const runMessageChannelSync = async (
  messageChannelId: string,
): Promise<void> => {
  const workspaceId = await scheduleChannelStage(
    MessageChannelEntity,
    messageChannelId,
    MessageChannelSyncStage.MESSAGE_LIST_FETCH_SCHEDULED,
  );

  await enqueueJobAndDrain(
    MessageQueue.messagingQueue,
    MessagingMessageListFetchJob.name,
    { workspaceId, messageChannelId },
    {
      workspaceId,
      applicationUniversalIdentifier:
        TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
    },
  );
};
