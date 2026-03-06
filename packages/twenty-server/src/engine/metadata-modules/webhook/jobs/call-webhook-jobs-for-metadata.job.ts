import chunk from 'lodash.chunk';
import { isDefined } from 'twenty-shared/utils';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { type MetadataEventBatch } from 'src/engine/metadata-event-emitter/types/metadata-event-batch.type';
import { type FlatWebhook } from 'src/engine/metadata-modules/flat-webhook/types/flat-webhook.type';
import { CallWebhookJob } from 'src/engine/metadata-modules/webhook/jobs/call-webhook.job';
import { type CallMetadataWebhookJobData } from 'src/engine/metadata-modules/webhook/types/webhook-job-data.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WEBHOOK_JOBS_CHUNK_SIZE = 20;

@Processor(MessageQueue.webhookQueue)
export class CallWebhookJobsForMetadataJob {
  constructor(
    @InjectMessageQueue(MessageQueue.webhookQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  @Process(CallWebhookJobsForMetadataJob.name)
  async handle(metadataEventBatch: MetadataEventBatch): Promise<void> {
    const eventName = metadataEventBatch.name;
    const metadataName = metadataEventBatch.metadataName;
    const operation = metadataEventBatch.type;

    const operationsToMatch = [
      eventName,
      `metadata.${metadataName}.*`,
      `metadata.*.${operation}`,
      `metadata.*.*`,
      '*.*',
    ];

    const { flatWebhookMaps } = await this.workspaceCacheService.getOrRecompute(
      metadataEventBatch.workspaceId,
      ['flatWebhookMaps'],
    );

    const webhooks = Object.values(flatWebhookMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter((webhook) =>
        operationsToMatch.some((operationToMatch) =>
          webhook.operations.includes(operationToMatch),
        ),
      );

    if (webhooks.length === 0) {
      return;
    }

    const webhookEvents = this.transformMetadataEventBatchToWebhookEvents({
      metadataEventBatch,
      webhooks,
    });

    const webhookEventsChunks = chunk(webhookEvents, WEBHOOK_JOBS_CHUNK_SIZE);

    for (const webhookEventsChunk of webhookEventsChunks) {
      await this.messageQueueService.add<CallMetadataWebhookJobData[]>(
        CallWebhookJob.name,
        webhookEventsChunk,
        { retryLimit: 3 },
      );
    }
  }

  private transformMetadataEventBatchToWebhookEvents({
    metadataEventBatch,
    webhooks,
  }: {
    metadataEventBatch: MetadataEventBatch;
    webhooks: FlatWebhook[];
  }): CallMetadataWebhookJobData[] {
    const result: CallMetadataWebhookJobData[] = [];

    for (const webhook of webhooks) {
      for (const event of metadataEventBatch.events) {
        result.push({
          targetUrl: webhook.targetUrl,
          eventName: metadataEventBatch.name,
          workspaceId: metadataEventBatch.workspaceId,
          webhookId: webhook.id,
          eventDate: new Date(),
          userId: metadataEventBatch.userId,
          apiKeyId: metadataEventBatch.apiKeyId,
          secret: webhook.secret,
          event,
        });
      }
    }

    return result;
  }
}
