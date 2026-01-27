import { InjectRepository } from '@nestjs/typeorm';

import chunk from 'lodash.chunk';
import { isDefined } from 'twenty-shared/utils';
import { IsNull, Not, Repository } from 'typeorm';

import type { ObjectRecordEvent } from 'twenty-shared/database-events';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { transformEventBatchToEventPayloads } from 'src/engine/metadata-modules/database-event-trigger/utils/transform-event-batch-to-event-payloads';
import {
  ServerlessFunctionTriggerJob,
  ServerlessFunctionTriggerJobData,
} from 'src/engine/metadata-modules/serverless-function/jobs/serverless-function-trigger.job';
import { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event-batch.type';

const DATABASE_EVENT_JOBS_CHUNK_SIZE = 20;

@Processor(MessageQueue.triggerQueue)
export class CallDatabaseEventTriggerJobsJob {
  constructor(
    @InjectMessageQueue(MessageQueue.serverlessFunctionQueue)
    private readonly messageQueueService: MessageQueueService,
    @InjectRepository(ServerlessFunctionEntity)
    private readonly serverlessFunctionRepository: Repository<ServerlessFunctionEntity>,
  ) {}

  @Process(CallDatabaseEventTriggerJobsJob.name)
  async handle(workspaceEventBatch: WorkspaceEventBatch<ObjectRecordEvent>) {
    const serverlessFunctionsWithDatabaseEventTrigger =
      await this.serverlessFunctionRepository.find({
        where: {
          workspaceId: workspaceEventBatch.workspaceId,
          databaseEventTriggerSettings: Not(IsNull()),
        },
        select: ['id', 'databaseEventTriggerSettings', 'workspaceId'],
      });

    const serverlessFunctionsToTrigger =
      serverlessFunctionsWithDatabaseEventTrigger.filter((serverlessFunction) =>
        this.shouldTriggerJob({
          workspaceEventBatch,
          eventName: isDefined(serverlessFunction.databaseEventTriggerSettings)
            ? serverlessFunction.databaseEventTriggerSettings.eventName
            : '',
        }),
      );

    const serverlessFunctionPayloads = transformEventBatchToEventPayloads({
      serverlessFunctions: serverlessFunctionsToTrigger,
      workspaceEventBatch,
    });

    if (serverlessFunctionPayloads.length === 0) {
      return;
    }

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
