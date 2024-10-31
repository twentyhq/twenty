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
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/services/api-event-emitter.service';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/workspace-event.type';
import {
  CallWebhookJob,
  CallWebhookJobData,
} from 'src/modules/webhook/jobs/call-webhook.job';

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
    data: WorkspaceEventBatch<ObjectRecordBaseEvent>,
  ): Promise<void> {
    // If you change that function, double check it does not break Zapier
    // trigger in packages/twenty-zapier/src/triggers/trigger_record.ts
    // Also change the openApi schema for webhooks
    // packages/twenty-server/src/engine/core-modules/open-api/utils/computeWebhooks.utils.ts

    console.log('CallWebhookJobsJob run', data);

    const webhookRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WebhookWorkspaceEntity>(
        data.workspaceId,
        'webhook',
      );

    const [nameSingular, operation] = data.name.split('.');

    const webhooks = await webhookRepository.find({
      where: [
        { operations: ArrayContains([data.name]) },
        { operations: ArrayContains([`*.${operation}`]) },
        { operations: ArrayContains([`${nameSingular}.*`]) },
        { operations: ArrayContains(['*.*']) },
      ],
    });

    for (const eventData of data.events) {
      let formattedRecord = {};

      if (operation === DatabaseEventAction.CREATED) {
        formattedRecord = eventData.properties.after;
      } else if (operation === DatabaseEventAction.UPDATED) {
        formattedRecord = eventData.properties.diff?.reduce(
          (acc, [key, value]) => {
            acc[key] = value.after;

            return acc;
          },
          { id: eventData.recordId },
        );
      } else if (
        [DatabaseEventAction.DELETED, DatabaseEventAction.DESTROYED].includes(
          operation as DatabaseEventAction,
        )
      ) {
        formattedRecord = {
          id: eventData.recordId,
        };
      } else {
        throw new Error(
          `operation '${operation}' invalid for webhook event ${data.name}`,
        );
      }

      webhooks.forEach((webhook) => {
        this.messageQueueService.add<CallWebhookJobData>(
          CallWebhookJob.name,
          {
            targetUrl: webhook.targetUrl,
            eventName: data.name,
            objectMetadata: {
              id: eventData.objectMetadata.id,
              nameSingular: eventData.objectMetadata.nameSingular,
            },
            workspaceId: data.workspaceId,
            webhookId: webhook.id,
            eventDate: new Date(),
            record: formattedRecord,
          },
          { retryLimit: 3 },
        );
      });

      webhooks.length > 0 &&
        this.logger.log(
          `CallWebhookJobsJob on eventName '${data.name}' triggered webhooks with ids [\n"${webhooks.map((webhook) => webhook.id).join('",\n"')}"\n]`,
        );
    }
  }
}
