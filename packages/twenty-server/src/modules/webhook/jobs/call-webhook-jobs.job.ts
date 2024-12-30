import { Logger } from '@nestjs/common';

import { ArrayContains } from 'typeorm';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WebhookWorkspaceEntity } from 'src/modules/webhook/standard-objects/webhook.workspace-entity';
import { ObjectRecordBaseEvent } from 'src/engine/core-modules/event-emitter/types/object-record.base.event';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';
import {
  CallWebhookJob,
  CallWebhookJobData,
} from 'src/modules/webhook/jobs/call-webhook.job';
import { removeSecretFromWebhookRecord } from 'src/utils/remove-secret-from-webhook-record';

@Processor(MessageQueue.webhookQueue)
export class CallWebhookJobsJob {
  private readonly logger = new Logger(CallWebhookJobsJob.name);

  constructor(
    @InjectMessageQueue(MessageQueue.webhookQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  @Process(CallWebhookJobsJob.name)
  async handle(
    workspaceEventBatch: WorkspaceEventBatch<ObjectRecordBaseEvent>,
  ): Promise<void> {
    // If you change that function, double check it does not break Zapier
    // trigger in packages/twenty-zapier/src/triggers/trigger_record.ts
    // Also change the openApi schema for webhooks
    // packages/twenty-server/src/engine/core-modules/open-api/utils/computeWebhooks.utils.ts

    const webhookRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WebhookWorkspaceEntity>(
        workspaceEventBatch.workspaceId,
        'webhook',
      );

    const [nameSingular, operation] = workspaceEventBatch.name.split('.');

    const webhooks = await webhookRepository.find({
      where: [
        { operations: ArrayContains([`${nameSingular}.${operation}`]) },
        { operations: ArrayContains([`*.${operation}`]) },
        { operations: ArrayContains([`${nameSingular}.*`]) },
        { operations: ArrayContains(['*.*']) },
      ],
    });

    for (const eventData of workspaceEventBatch.events) {
      const eventName = workspaceEventBatch.name;
      const objectMetadata = {
        id: eventData.objectMetadata.id,
        nameSingular: eventData.objectMetadata.nameSingular,
      };
      const workspaceId = workspaceEventBatch.workspaceId;
      const record = eventData.properties.after || eventData.properties.before;
      const updatedFields = eventData.properties.updatedFields;

      const isWebhookEvent = nameSingular === 'webhook';
      const sanitizedRecord = removeSecretFromWebhookRecord(
        record,
        isWebhookEvent,
      );

      webhooks.forEach((webhook) => {
        const webhookData = {
          targetUrl: webhook.targetUrl,
          secret: webhook.secret,
          eventName,
          objectMetadata,
          workspaceId,
          webhookId: webhook.id,
          eventDate: new Date(),
          record: sanitizedRecord,
          ...(updatedFields && { updatedFields }),
        };

        this.messageQueueService.add<CallWebhookJobData>(
          CallWebhookJob.name,
          webhookData,
          { retryLimit: 3 },
        );
      });

      webhooks.length > 0 &&
        this.logger.log(
          `CallWebhookJobsJob on eventName '${workspaceEventBatch.name}' triggered webhooks with ids [\n"${webhooks.map((webhook) => webhook.id).join('",\n"')}"\n]`,
        );
    }
  }
}
