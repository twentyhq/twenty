import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { In, Repository } from 'typeorm';

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
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import {
  WorkflowRunStatus,
  WorkflowRunWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { NUMBER_OF_WORKFLOW_RUNS_TO_KEEP } from 'src/modules/workflow/workflow-runner/workflow-run-queue/constants/number-of-workflow-runs-to-keep';
import {
  WorkflowCleanWorkflowRunsJob,
  WorkflowCleanWorkflowRunsJobData,
} from 'src/modules/workflow/workflow-runner/workflow-run-queue/jobs/workflow-clean-workflow-runs.job';
import { getRunsToCleanFindOptions } from 'src/modules/workflow/workflow-runner/workflow-run-queue/utils/get-runs-to-clean-find-options.util';

export const CLEAN_WORKFLOW_RUN_CRON_PATTERN = '0 */3 * * *';

const LAST_PARTITION_CACHE_KEY = 'workflow-clean-workflow-runs:last-partition';
const NUMBER_OF_PARTITIONS = 10;
const WORKSPACE_BATCH_SIZE = 10;
const ACTIVE_WORKSPACES_FETCH_WARNING_THRESHOLD_MS = 5000;

@Processor(MessageQueue.cronQueue)
export class WorkflowCleanWorkflowRunsCronJob {
  private readonly logger = new Logger(WorkflowCleanWorkflowRunsCronJob.name);

  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectMessageQueue(MessageQueue.workflowQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly exceptionHandlerService: ExceptionHandlerService,
    @InjectCacheStorage(CacheStorageNamespace.ModuleWorkflow)
    private readonly cacheStorageService: CacheStorageService,
  ) {}

  @Process(WorkflowCleanWorkflowRunsCronJob.name)
  @SentryCronMonitor(
    WorkflowCleanWorkflowRunsCronJob.name,
    CLEAN_WORKFLOW_RUN_CRON_PATTERN,
  )
  async handle() {
    this.logger.log('Starting WorkflowCleanWorkflowRunsCronJob cron');

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
          `WorkflowCleanWorkflowRunsCronJob failed for ${failedWorkspaceIds.length} workspace(s) in current batch`,
        );

        this.exceptionHandlerService.captureExceptions(
          [
            firstRejectedReason instanceof Error
              ? firstRejectedReason
              : new Error('Workflow clean runs batch failed'),
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
      `Completed WorkflowCleanWorkflowRunsCronJob cron (partition ${partition}/${NUMBER_OF_PARTITIONS}), enqueued ${enqueuedCount} jobs`,
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
        'Failed to fetch active workspaces in WorkflowCleanWorkflowRunsCronJob',
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
            cronJobName: WorkflowCleanWorkflowRunsCronJob.name,
            operation: 'fetch-active-workspaces',
          },
        },
      );

      throw error;
    }
  }

  private async checkAndEnqueue(workspaceId: string): Promise<boolean> {
    const hasRunsToClean = await this.hasRunsToClean(workspaceId);

    if (hasRunsToClean) {
      await this.messageQueueService.add<WorkflowCleanWorkflowRunsJobData>(
        WorkflowCleanWorkflowRunsJob.name,
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

  private async hasRunsToClean(workspaceId: string): Promise<boolean> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const workflowRunRepository =
          await this.globalWorkspaceOrmManager.getRepository(
            workspaceId,
            WorkflowRunWorkspaceEntity,
            { shouldBypassPermissionChecks: true },
          );

        const hasOldRuns = await workflowRunRepository.exists({
          where: getRunsToCleanFindOptions(),
        });

        if (hasOldRuns) {
          return true;
        }

        const totalCompletedRunsCount = await workflowRunRepository.count({
          where: {
            status: In([WorkflowRunStatus.COMPLETED, WorkflowRunStatus.FAILED]),
          },
        });

        return totalCompletedRunsCount > NUMBER_OF_WORKFLOW_RUNS_TO_KEEP;
      },
      authContext,
      { lite: true },
    );
  }
}
