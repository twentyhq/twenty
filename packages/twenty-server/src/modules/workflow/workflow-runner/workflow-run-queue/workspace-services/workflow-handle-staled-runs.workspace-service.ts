import { Injectable, Logger } from '@nestjs/common';

import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { StepStatus } from 'twenty-shared/workflow';
import { type FindOptionsWhere } from 'typeorm';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import {
  WorkflowRunStatus,
  WorkflowRunWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { workflowHasRunningSteps } from 'src/modules/workflow/common/utils/workflow-has-running-steps.util';
import { workflowShouldFail } from 'src/modules/workflow/workflow-executor/utils/workflow-should-fail.util';
import { workflowShouldKeepRunning } from 'src/modules/workflow/workflow-executor/utils/workflow-should-keep-running.util';
import { type RunWorkflowJobData } from 'src/modules/workflow/workflow-runner/types/run-workflow-job-data.type';
import { getStaledRunsFindOptions } from 'src/modules/workflow/workflow-runner/workflow-run-queue/utils/get-staled-runs-find-options.util';
import { getStuckRunningRunsFindOptions } from 'src/modules/workflow/workflow-runner/workflow-run-queue/utils/get-stuck-running-runs-find-options.util';
import { getStuckRunningRunsMonitorCacheKey } from 'src/modules/workflow/workflow-runner/workflow-run-queue/utils/get-stuck-running-runs-monitor-cache-key.util';
import { getStuckStoppingRunsFindOptions } from 'src/modules/workflow/workflow-runner/workflow-run-queue/utils/get-stuck-stopping-runs-find-options.util';
import { WorkflowThrottlingWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workspace-services/workflow-throttling.workspace-service';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

@Injectable()
export class WorkflowHandleStaledRunsWorkspaceService {
  private readonly logger = new Logger(
    WorkflowHandleStaledRunsWorkspaceService.name,
  );
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly workflowThrottlingWorkspaceService: WorkflowThrottlingWorkspaceService,
    private readonly workflowRunWorkspaceService: WorkflowRunWorkspaceService,
    @InjectMessageQueue(MessageQueue.workflowQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly metricsService: MetricsService,
    @InjectCacheStorage(CacheStorageNamespace.ModuleWorkflow)
    private readonly cacheStorageService: CacheStorageService,
  ) {}

  async handleStaledRunsForWorkspace(workspaceId: string) {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const workflowRunRepository =
        await this.globalWorkspaceOrmManager.getRepository(
          workspaceId,
          WorkflowRunWorkspaceEntity,
          { shouldBypassPermissionChecks: true },
        );

      const staledRunsCount = await workflowRunRepository.count({
        where: getStaledRunsFindOptions(),
      });

      if (staledRunsCount <= 0) {
        return;
      }

      const batchCount = Math.ceil(staledRunsCount / QUERY_MAX_RECORDS);

      for (let batchIndex = 0; batchIndex < batchCount; batchIndex++) {
        const staledWorkflowRuns = await workflowRunRepository.find({
          where: getStaledRunsFindOptions(),
          select: {
            id: true,
          },
          order: {
            createdAt: 'ASC',
          },
          take: QUERY_MAX_RECORDS,
        });

        if (staledWorkflowRuns.length <= 0) {
          break;
        }

        await workflowRunRepository.update(
          staledWorkflowRuns.map((workflowRun) => workflowRun.id),
          {
            enqueuedAt: null,
            status: WorkflowRunStatus.NOT_STARTED,
          },
        );
      }

      await this.workflowThrottlingWorkspaceService.recomputeWorkflowRunNotStartedCount(
        workspaceId,
      );
    }, authContext);
  }

  async handleStuckStoppingRunsForWorkspace(workspaceId: string) {
    const stuckStoppingRunIds = await this.collectRunIds({
      workspaceId,
      findOptions: getStuckStoppingRunsFindOptions(),
    });

    for (const workflowRunId of stuckStoppingRunIds) {
      try {
        await this.workflowRunWorkspaceService.endWorkflowRun({
          workflowRunId,
          workspaceId,
          status: WorkflowRunStatus.STOPPED,
        });
      } catch (error) {
        this.logger.error(
          `Failed to finalize stuck stopping workflow run ${workflowRunId} for workspace ${workspaceId}`,
          error,
        );
      }
    }
  }

  // Monitoring mode: stuck RUNNING runs are only flagged, never finalized.
  // Flagged runs are re-checked on every sweep; one that ends or gets a new
  // job on its own is a false positive, disproving that it was stuck forever.
  async handleStuckRunningRunsForWorkspace(workspaceId: string) {
    const cacheKey = getStuckRunningRunsMonitorCacheKey(workspaceId);
    const flaggedRuns =
      (await this.cacheStorageService.get<Record<string, string>>(cacheKey)) ??
      {};

    const stuckRunningRunIds = await this.collectRunIds({
      workspaceId,
      findOptions: getStuckRunningRunsFindOptions(),
    });

    if (
      stuckRunningRunIds.length === 0 &&
      Object.keys(flaggedRuns).length === 0
    ) {
      return;
    }

    const inFlightJobs =
      await this.messageQueueService.getInFlightJobs<RunWorkflowJobData>();

    const hasInFlightJob = (workflowRunId: string) =>
      inFlightJobs.some(
        (job) =>
          job.id?.startsWith(`${workflowRunId}-`) ||
          job.data?.workflowRunId === workflowRunId,
      );

    const stillFlaggedRuns: Record<string, string> = {};

    for (const [workflowRunId, detectedAt] of Object.entries(flaggedRuns)) {
      try {
        const workflowRun =
          await this.workflowRunWorkspaceService.getWorkflowRunOrFail({
            workflowRunId,
            workspaceId,
          });

        if (
          workflowRun.status !== WorkflowRunStatus.RUNNING ||
          hasInFlightJob(workflowRunId)
        ) {
          this.logger.warn(
            `Stuck running workflow run ${workflowRunId} in workspace ${workspaceId} was a false positive: flagged at ${detectedAt}, now in status ${workflowRun.status}`,
          );

          await this.metricsService.incrementCounterForEvent({
            key: MetricsKeys.WorkflowRunStuckRunningFalsePositive,
            eventId: workflowRunId,
          });
        } else {
          stillFlaggedRuns[workflowRunId] = detectedAt;
        }
      } catch (error) {
        stillFlaggedRuns[workflowRunId] = detectedAt;
        this.logger.error(
          `Failed to re-check flagged stuck running workflow run ${workflowRunId} for workspace ${workspaceId}`,
          error,
        );
      }
    }

    for (const workflowRunId of stuckRunningRunIds) {
      if (
        isDefined(flaggedRuns[workflowRunId]) ||
        hasInFlightJob(workflowRunId)
      ) {
        continue;
      }

      try {
        const expectedOutcome = await this.computeStuckRunningRunOutcome({
          workflowRunId,
          workspaceId,
        });

        if (!isDefined(expectedOutcome)) {
          continue;
        }

        stillFlaggedRuns[workflowRunId] = new Date().toISOString();

        this.logger.warn(
          `Workflow run ${workflowRunId} in workspace ${workspaceId} is stuck in RUNNING without a queue job and would have been finalized as ${expectedOutcome}`,
        );

        await this.metricsService.incrementCounterForEvent({
          key: MetricsKeys.WorkflowRunStuckRunningDetected,
          eventId: workflowRunId,
        });
      } catch (error) {
        this.logger.error(
          `Failed to check stuck running workflow run ${workflowRunId} for workspace ${workspaceId}`,
          error,
        );
      }
    }

    await this.cacheStorageService.set(cacheKey, stillFlaggedRuns);
  }

  private async computeStuckRunningRunOutcome({
    workflowRunId,
    workspaceId,
  }: {
    workflowRunId: string;
    workspaceId: string;
  }): Promise<WorkflowRunStatus | undefined> {
    const workflowRun =
      await this.workflowRunWorkspaceService.getWorkflowRunOrFail({
        workflowRunId,
        workspaceId,
      });

    if (workflowRun.status !== WorkflowRunStatus.RUNNING) {
      return undefined;
    }

    const stepInfos = workflowRun.state?.stepInfos;
    const steps = workflowRun.state?.flow?.steps;

    if (
      !isDefined(stepInfos) ||
      !isDefined(steps) ||
      workflowHasRunningSteps({ stepInfos, steps })
    ) {
      return WorkflowRunStatus.FAILED;
    }

    if (workflowShouldFail({ stepInfos, steps })) {
      return WorkflowRunStatus.FAILED;
    }

    const hasPendingSteps = steps.some(
      (step) => stepInfos[step.id]?.status === StepStatus.PENDING,
    );

    if (hasPendingSteps) {
      return undefined;
    }

    if (workflowShouldKeepRunning({ stepInfos, steps })) {
      return WorkflowRunStatus.FAILED;
    }

    return WorkflowRunStatus.COMPLETED;
  }

  private async collectRunIds({
    workspaceId,
    findOptions,
  }: {
    workspaceId: string;
    findOptions: FindOptionsWhere<WorkflowRunWorkspaceEntity>;
  }): Promise<string[]> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const workflowRunRepository =
          await this.globalWorkspaceOrmManager.getRepository(
            workspaceId,
            WorkflowRunWorkspaceEntity,
            { shouldBypassPermissionChecks: true },
          );

        const runIds: string[] = [];
        let page: WorkflowRunWorkspaceEntity[];

        do {
          page = await workflowRunRepository.find({
            where: findOptions,
            select: { id: true },
            order: { createdAt: 'ASC', id: 'ASC' },
            take: QUERY_MAX_RECORDS,
            skip: runIds.length,
          });

          runIds.push(...page.map((workflowRun) => workflowRun.id));
        } while (page.length === QUERY_MAX_RECORDS);

        return runIds;
      },
      authContext,
    );
  }
}
