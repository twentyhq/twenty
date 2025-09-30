import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import type { ObjectRecordEvent } from 'src/engine/core-modules/event-emitter/types/object-record-event.event';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { DatabaseEventTrigger } from 'src/engine/metadata-modules/database-event-trigger/entities/database-event-trigger.entity';
import {
  ServerlessFunctionTriggerJob,
  ServerlessFunctionTriggerJobData,
} from 'src/engine/metadata-modules/serverless-function/jobs/serverless-function-trigger.job';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';

@Processor(MessageQueue.triggerQueue)
export class CallDatabaseEventTriggerJobsJob {
  constructor(
    @InjectMessageQueue(MessageQueue.serverlessFunctionQueue)
    private readonly messageQueueService: MessageQueueService,
    @InjectRepository(DatabaseEventTrigger)
    private readonly databaseEventTriggerRepository: Repository<DatabaseEventTrigger>,
  ) {}

  @Process(CallDatabaseEventTriggerJobsJob.name)
  async handle(workspaceEventBatch: WorkspaceEventBatch<ObjectRecordEvent>) {
    const databaseEventListeners =
      await this.databaseEventTriggerRepository.find({
        where: {
          workspaceId: workspaceEventBatch.workspaceId,
        },
        select: ['id', 'settings', 'workspaceId'],
        relations: ['serverlessFunction'],
      });

    for (const databaseEventListener of databaseEventListeners) {
      if (
        !this.shouldTriggerJob({
          workspaceEventBatch,
          eventName: databaseEventListener.settings.eventName,
        })
      ) {
        continue;
      }

      for (const eventData of workspaceEventBatch.events) {
        await this.messageQueueService.add<ServerlessFunctionTriggerJobData>(
          ServerlessFunctionTriggerJob.name,
          {
            serverlessFunctionId: databaseEventListener.serverlessFunction.id,
            workspaceId: databaseEventListener.workspaceId,
            payload: eventData,
          },
          { retryLimit: 3 },
        );
      }
    }
  }

  private shouldTriggerJob({
    workspaceEventBatch,
    eventName,
  }: {
    workspaceEventBatch: WorkspaceEventBatch<ObjectRecordEvent>;
    eventName: string;
  }) {
    const [nameSingular, operation] = workspaceEventBatch.name.split('.');

    const validEventNames = [
      `${nameSingular}.${operation}`,
      `*.${operation}`,
      `${nameSingular}.*`,
      '*.*',
    ];

    return validEventNames.includes(eventName);
  }
}
