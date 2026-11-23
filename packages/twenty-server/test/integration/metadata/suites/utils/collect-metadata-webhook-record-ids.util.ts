import { isArray } from '@sniptt/guards';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { isPlainObject } from 'twenty-shared/utils';

import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { type MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { getQueueToken } from 'src/engine/core-modules/message-queue/utils/get-queue-token.util';
import { type CallWebhookJobsForMetadataJob } from 'src/engine/metadata-modules/webhook/jobs/call-webhook-jobs-for-metadata.job';
import { type CallMetadataWebhookJobData } from 'src/engine/metadata-modules/webhook/types/webhook-job-data.type';
import { type MetadataEventBatch } from 'src/engine/subscriptions/metadata-event/types/metadata-event-batch.type';

export const collectMetadataWebhookRecordIds = async ({
  metadataEventBatch,
  webhookId,
}: {
  metadataEventBatch: MetadataEventBatch;
  webhookId: string;
}): Promise<string[]> => {
  const addJob = jest
    .spyOn(
      global.app.get<MessageQueueService>(
        getQueueToken(MessageQueue.webhookQueue),
      ),
      'add',
    )
    .mockResolvedValue(undefined);

  await getAppProviderByClassName<CallWebhookJobsForMetadataJob>(
    'CallWebhookJobsForMetadataJob',
  ).handle(metadataEventBatch);

  const batchRecordIds = metadataEventBatch.events.map(
    ({ recordId }) => recordId,
  );

  const recordIds = addJob.mock.calls
    .flatMap(([, jobData]) => (isArray(jobData) ? jobData : []))
    .filter(
      (jobData): jobData is CallMetadataWebhookJobData =>
        isPlainObject(jobData) && jobData.webhookId === webhookId,
    )
    .map((jobData) => jobData.event.recordId)
    .filter((recordId) => batchRecordIds.includes(recordId));

  addJob.mockRestore();

  return recordIds;
};
