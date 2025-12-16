import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import chunk from 'lodash.chunk';

import type { ObjectRecordEvent } from 'twenty-shared/database-events';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { DatabaseEventTriggerEntity } from 'src/engine/metadata-modules/database-event-trigger/entities/database-event-trigger.entity';
import {
  ServerlessFunctionTriggerJob,
  ServerlessFunctionTriggerJobData,
} from 'src/engine/metadata-modules/serverless-function/jobs/serverless-function-trigger.job';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';
import { transformEventBatchToEventPayloads } from 'src/engine/metadata-modules/database-event-trigger/utils/transform-event-batch-to-event-payloads';

const DATABASE_EVENT_JOBS_CHUNK_SIZE = 20;

@Processor(MessageQueue.triggerQueue)
export class CallDatabaseEventTriggerJobsJob {
  constructor(
    @InjectMessageQueue(MessageQueue.serverlessFunctionQueue)
    private readonly messageQueueService: MessageQueueService,
    @InjectRepository(DatabaseEventTriggerEntity)
    private readonly databaseEventTriggerRepository: Repository<DatabaseEventTriggerEntity>,
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

    const databaseEventListenersToTrigger = databaseEventListeners.filter(
      (databaseEventListener) =>
        this.shouldTriggerJob({
          workspaceEventBatch,
          eventName: databaseEventListener.settings.eventName,
        }),
    );

    const serverlessFunctionPayloads = transformEventBatchToEventPayloads({
      databaseEventListeners: databaseEventListenersToTrigger,
      workspaceEventBatch,
    });

    const serverlessFunctionPayloadsChunks = chunk(
      serverlessFunctionPayloads,
      DATABASE_EVENT_JOBS_CHUNK_SIZE,
    );

    for (const serverlessFunctionPayloadsChunk of serverlessFunctionPayloadsChunks) {
      await this.messageQueueService.add<ServerlessFunctionTriggerJobData[]>(
        ServerlessFunctionTriggerJob.name,
        serverlessFunctionPayloadsChunk,
        { retryLimit: 3 },
      );
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
