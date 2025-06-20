import { Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ObjectRecordEvent } from 'src/engine/core-modules/event-emitter/types/object-record-event.event';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WebhookService } from 'src/engine/core-modules/webhook/webhook.service';
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
    private readonly webhookService: WebhookService,
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

    // Use core webhooks but preserve exact same ArrayContains logic
    const webhooks = await this.webhookService.findByOperations(
      workspaceEventBatch.workspaceId,
      [
        `${nameSingular}.${operation}`,
        `*.${operation}`,
        `${nameSingular}.*`,
        '*.*',
      ],
    );

    for (const eventData of workspaceEventBatch.events) {
      const eventName = workspaceEventBatch.name;
      const objectMetadata = {
        id: eventData.objectMetadata.id,
        nameSingular: eventData.objectMetadata.nameSingular,
      };
      const workspaceId = workspaceEventBatch.workspaceId;
      const record =
        'after' in eventData.properties && isDefined(eventData.properties.after)
          ? eventData.properties.after
          : 'before' in eventData.properties &&
              isDefined(eventData.properties.before)
            ? eventData.properties.before
            : {};
      const updatedFields =
        'updatedFields' in eventData.properties
          ? eventData.properties.updatedFields
          : undefined;

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
    }
  }
}
