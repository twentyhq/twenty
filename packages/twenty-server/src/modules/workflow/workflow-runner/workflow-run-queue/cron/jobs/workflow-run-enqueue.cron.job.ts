import { Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { DataSource, Repository } from 'typeorm';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import {
  WorkflowRunEnqueueJob,
  WorkflowRunEnqueueJobData,
} from 'src/modules/workflow/workflow-runner/workflow-run-queue/jobs/workflow-run-enqueue.job';
export const WORKFLOW_RUN_ENQUEUE_CRON_PATTERN = '* * * * *';

const LAST_PARTITION_CACHE_KEY = 'workflow-run-enqueue:last-partition';
const NUMBER_OF_PARTITIONS = 10;
const WORKSPACE_BATCH_SIZE = 10;

@Processor(MessageQueue.cronQueue)
export class WorkflowRunEnqueueCronJob {
  private readonly logger = new Logger(WorkflowRunEnqueueCronJob.name);

  constructor(
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectMessageQueue(MessageQueue.workflowQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
    @InjectCacheStorage(CacheStorageNamespace.ModuleWorkflow)
    private readonly cacheStorageService: CacheStorageService,
  ) {}

  @Process(WorkflowRunEnqueueCronJob.name)
  @SentryCronMonitor(
    WorkflowRunEnqueueCronJob.name,
    WORKFLOW_RUN_ENQUEUE_CRON_PATTERN,
  )
  async handle() {
    this.logger.log('Starting WorkflowRunEnqueueCronJob cron');

    const allActiveWorkspaces = await this.workspaceRepository.find({
      where: {
        activationStatus: WorkspaceActivationStatus.ACTIVE,
      },
      select: ['id'],
      order: { id: 'ASC' },
    });

    const partition = await this.getAndIncrementPartition();
    const workspacesForThisRun = allActiveWorkspaces.filter(
      (_, index) => index % NUMBER_OF_PARTITIONS === partition,
    );

    let enqueuedCount = 0;

    for (
      let workspaceIndex = 0;
      workspaceIndex < workspacesForThisRun.length;
      workspaceIndex += WORKSPACE_BATCH_SIZE
    ) {
      const batch = workspacesForThisRun.slice(
        workspaceIndex,
        workspaceIndex + WORKSPACE_BATCH_SIZE,
      );

      const results = await Promise.allSettled(
        batch.map((workspace) => this.checkAndEnqueue(workspace.id)),
      );

      for (const [index, result] of results.entries()) {
        if (result.status === 'fulfilled' && result.value) {
          enqueuedCount++;
        }

        if (result.status === 'rejected') {
          this.exceptionHandlerService.captureExceptions([result.reason], {
            workspace: { id: batch[index].id },
          });
        }
      }
    }

    this.logger.log(
      `Completed WorkflowRunEnqueueCronJob cron (partition ${partition}/${NUMBER_OF_PARTITIONS}), enqueued ${enqueuedCount} jobs`,
    );
  }

  private async checkAndEnqueue(workspaceId: string): Promise<boolean> {
    const hasNotStartedRuns = await this.hasNotStartedRuns(workspaceId);

    if (hasNotStartedRuns) {
      await this.messageQueueService.add<WorkflowRunEnqueueJobData>(
        WorkflowRunEnqueueJob.name,
        { workspaceId, isCacheMode: false },
      );

      return true;
    }

    return false;
  }

  private async getAndIncrementPartition(): Promise<number> {
    const lastPartition = await this.cacheStorageService.get<number>(
      LAST_PARTITION_CACHE_KEY,
    );

    const partition =
      lastPartition !== undefined
        ? (lastPartition + 1) % NUMBER_OF_PARTITIONS
        : 0;

    await this.cacheStorageService.set(LAST_PARTITION_CACHE_KEY, partition);

    return partition;
  }

  private async hasNotStartedRuns(workspaceId: string): Promise<boolean> {
    const schemaName = getWorkspaceSchemaName(workspaceId);

    const result = await this.coreDataSource.query(
      `SELECT 1 FROM ${schemaName}."workflowRun" WHERE "status" = $1 LIMIT 1`,
      [WorkflowRunStatus.NOT_STARTED],
    );

    return result.length > 0;
  }
}
