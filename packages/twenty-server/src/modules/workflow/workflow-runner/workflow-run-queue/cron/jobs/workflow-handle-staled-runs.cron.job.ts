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
import { STALED_RUNS_THRESHOLD_MS } from 'src/modules/workflow/workflow-runner/workflow-run-queue/constants/staled-runs-threshold';
import {
  WorkflowHandleStaledRunsJob,
  WorkflowHandleStaledRunsJobData,
} from 'src/modules/workflow/workflow-runner/workflow-run-queue/jobs/workflow-handle-staled-runs.job';
export const WORKFLOW_HANDLE_STALED_RUNS_CRON_PATTERN = '*/10 * * * *';

const LAST_PARTITION_CACHE_KEY = 'workflow-handle-staled-runs:last-partition';
const NUMBER_OF_PARTITIONS = 10;
const WORKSPACE_BATCH_SIZE = 50;
const ACTIVE_WORKSPACES_FETCH_WARNING_THRESHOLD_MS = 5000;

@Processor(MessageQueue.cronQueue)
export class WorkflowHandleStaledRunsCronJob {
  private readonly logger = new Logger(WorkflowHandleStaledRunsCronJob.name);

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

  @Process(WorkflowHandleStaledRunsCronJob.name)
  @SentryCronMonitor(
    WorkflowHandleStaledRunsCronJob.name,
    WORKFLOW_HANDLE_STALED_RUNS_CRON_PATTERN,
  )
  async handle() {
    this.logger.log('Starting WorkflowHandleStaledRunsCronJob cron');

    const allActiveWorkspaces = await this.getAllActiveWorkspaces();

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

      const failedWorkspaceIds: string[] = [];
      let firstRejectedReason: unknown;

      for (const [index, result] of results.entries()) {
        if (result.status === 'fulfilled' && result.value) {
          enqueuedCount++;
        }

        if (result.status === 'rejected') {
          failedWorkspaceIds.push(batch[index].id);
          firstRejectedReason ??= result.reason;
        }
      }

      if (failedWorkspaceIds.length > 0) {
        this.logger.warn(
          `WorkflowHandleStaledRunsCronJob failed for ${failedWorkspaceIds.length} workspace(s) in current batch`,
        );

        this.exceptionHandlerService.captureExceptions(
          [
            firstRejectedReason instanceof Error
              ? firstRejectedReason
              : new Error('Workflow staled runs batch failed'),
          ],
          {
            workspace: { id: failedWorkspaceIds[0] },
            additionalData: {
              failedWorkspaceIds,
              failedWorkspaceCount: failedWorkspaceIds.length,
            },
          },
        );
      }
    }

    this.logger.log(
      `Completed WorkflowHandleStaledRunsCronJob cron (partition ${partition}/${NUMBER_OF_PARTITIONS}), enqueued ${enqueuedCount} jobs`,
    );
  }

  private async getAllActiveWorkspaces(): Promise<Array<{ id: string }>> {
    const activeWorkspacesFetchStartTime = performance.now();

    try {
      const activeWorkspaces = await this.workspaceRepository.find({
        where: {
          activationStatus: WorkspaceActivationStatus.ACTIVE,
        },
        select: ['id'],
        order: { id: 'ASC' },
      });

      const activeWorkspacesFetchDurationMs =
        performance.now() - activeWorkspacesFetchStartTime;

      if (
        activeWorkspacesFetchDurationMs >=
        ACTIVE_WORKSPACES_FETCH_WARNING_THRESHOLD_MS
      ) {
        this.logger.warn(
          `Active workspace fetch is slow (${activeWorkspacesFetchDurationMs.toFixed(2)}ms for ${activeWorkspaces.length} workspaces)`,
        );
      }

      return activeWorkspaces;
    } catch (error) {
      this.logger.error(
        'Failed to fetch active workspaces in WorkflowHandleStaledRunsCronJob',
        error instanceof Error ? error.stack : undefined,
      );

      this.exceptionHandlerService.captureExceptions(
        [
          error instanceof Error
            ? error
            : new Error('Failed to fetch active workspaces'),
        ],
        {
          additionalData: {
            cronJobName: WorkflowHandleStaledRunsCronJob.name,
            operation: 'fetch-active-workspaces',
          },
        },
      );

      throw error;
    }
  }

  private async checkAndEnqueue(workspaceId: string): Promise<boolean> {
    const hasStaledRuns = await this.hasStaledRuns(workspaceId);

    if (hasStaledRuns) {
      await this.messageQueueService.add<WorkflowHandleStaledRunsJobData>(
        WorkflowHandleStaledRunsJob.name,
        { workspaceId },
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

  private async hasStaledRuns(workspaceId: string): Promise<boolean> {
    const schemaName = getWorkspaceSchemaName(workspaceId);
    const thresholdDate = new Date(Date.now() - STALED_RUNS_THRESHOLD_MS);

    const result = await this.coreDataSource.query(
      `SELECT 1 FROM ${schemaName}."workflowRun" WHERE "status" = $1 AND ("enqueuedAt" < $2 OR "enqueuedAt" IS NULL) LIMIT 1`,
      [WorkflowRunStatus.ENQUEUED, thresholdDate],
    );

    return result.length > 0;
  }
}
