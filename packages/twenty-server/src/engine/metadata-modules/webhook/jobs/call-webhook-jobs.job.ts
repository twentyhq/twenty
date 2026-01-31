import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import chunk from 'lodash.chunk';
import { ArrayContains, IsNull, Repository } from 'typeorm';

import type { ObjectRecordEvent } from 'twenty-shared/database-events';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  CallWebhookJob,
  type CallWebhookJobData,
} from 'src/engine/metadata-modules/webhook/jobs/call-webhook.job';
import { transformEventBatchToWebhookEvents } from 'src/engine/metadata-modules/webhook/utils/transform-event-batch-to-webhook-events';
import { WebhookEntity } from 'src/engine/metadata-modules/webhook/entities/webhook.entity';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';

const WEBHOOK_JOBS_CHUNK_SIZE = 20;

@Processor(MessageQueue.webhookQueue)
export class CallWebhookJobsJob {
  private readonly logger = new Logger(CallWebhookJobsJob.name);
  constructor(
    @InjectMessageQueue(MessageQueue.webhookQueue)
    private readonly messageQueueService: MessageQueueService,
    @InjectRepository(WebhookEntity)
    private readonly webhookRepository: Repository<WebhookEntity>,
  ) {}

  @Process(CallWebhookJobsJob.name)
  async handle(
    workspaceEventBatch: WorkspaceEventBatch<ObjectRecordEvent>,
  ): Promise<void> {
    // If you change that function, double check it does not break Zapier
    // trigger in packages/twenty-zapier/src/triggers/trigger_record.ts
    // Also change the openApi schema for webhooks
    // packages/twenty-server/src/engine/core-modules/open-api/utils/computeWebhooks.utils.ts

    const [nameSingular, operation] = workspaceEventBatch.name.split('.');

    const operations = [
      `${nameSingular}.${operation}`,
      `*.${operation}`,
      `${nameSingular}.*`,
      '*.*',
    ];

    const webhooks = await this.webhookRepository.find({
      where: operations.map((op) => ({
        workspaceId: workspaceEventBatch.workspaceId,
        operations: ArrayContains([op]),
        deletedAt: IsNull(),
      })),
    });

    const webhookEvents = transformEventBatchToWebhookEvents({
      workspaceEventBatch,
      webhooks,
    });

    const webhookEventsChunks = chunk(webhookEvents, WEBHOOK_JOBS_CHUNK_SIZE);

    for (const webhookEventsChunk of webhookEventsChunks) {
      await this.messageQueueService.add<CallWebhookJobData[]>(
        CallWebhookJob.name,
        webhookEventsChunk,
        { retryLimit: 3 },
      );
    }
  }
}
