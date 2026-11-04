import { Injectable, Logger } from '@nestjs/common';

import chunk from 'lodash.chunk';
import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { StepStatus } from 'twenty-shared/workflow';
import { type FindOptionsWhere, In } from 'typeorm';

import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { getQueueJobIdPrefix } from 'src/engine/core-modules/message-queue/utils/get-queue-job-id-prefix.util';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import {
  WorkflowRunStatus,
  WorkflowRunWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { workflowHasRunningSteps } from 'src/modules/workflow/common/utils/workflow-has-running-steps.util';
import { workflowShouldFail } from 'src/modules/workflow/workflow-executor/utils/workflow-should-fail.util';
import { workflowShouldKeepRunning } from 'src/modules/workflow/workflow-executor/utils/workflow-should-keep-running.util';
import { RUN_WORKFLOW_JOB_NAME } from 'src/modules/workflow/workflow-runner/constants/run-workflow-job-name';
import { type RunWorkflowJobData } from 'src/modules/workflow/workflow-runner/types/run-workflow-job-data.type';
import { buildRunWorkflowJobOptions } from 'src/modules/workflow/workflow-runner/utils/build-run-workflow-job-options.util';
import { getStaledRunsFindOptions } from 'src/modules/workflow/workflow-runner/workflow-run-queue/utils/get-staled-runs-find-options.util';
import { getStuckRunningRunsFindOptions } from 'src/modules/workflow/workflow-runner/workflow-run-queue/utils/get-stuck-running-runs-find-options.util';
import { getStuckRunningRunsMonitorCacheKey } from 'src/modules/workflow/workflow-runner/workflow-run-queue/utils/get-stuck-running-runs-monitor-cache-key.util';
import { getStuckStoppingRunsFindOptions } from 'src/modules/workflow/workflow-runner/workflow-run-queue/utils/get-stuck-stopping-runs-find-options.util';
import { WorkflowRunJobScopeWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run-job-scope.workspace-service';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

type WorkflowRunReference = Pick<
  WorkflowRunWorkspaceEntity,
  'id' | 'coreWorkflowId'
>;

@Injectable()
export class WorkflowHandleStaledRunsWorkspaceService {
  private readonly logger = new Logger(
    WorkflowHandleStaledRunsWorkspaceService.name,
  );
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly workflowRunWorkspaceService: WorkflowRunWorkspaceService,
    private readonly workflowRunJobScopeWorkspaceService: WorkflowRunJobScopeWorkspaceService,
    @InjectMessageQueue(MessageQueue.workflowQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly metricsService: MetricsService,
    @InjectCacheStorage(CacheStorageNamespace.ModuleWorkflow)
    private readonly cacheStorageService: CacheStorageService,
  ) {}

  // A run of a tenant with a backlog can wait in the queue past the threshold, so only a run whose job is gone gets a new one
  async handleStaledRunsForWorkspace(workspaceId: string) {
    const staledRuns = await this.collectRuns({
      workspaceId,
      findOptions: getStaledRunsFindOptions(),
    });

    if (staledRuns.length === 0) {
      return;
    }

    const hasInFlightJob = await this.buildInFlightJobLookup();
    const lostRuns = staledRuns.filter(({ id }) => !hasInFlightJob(id));

    if (lostRuns.length === 0) {
      return;
    }

    const resolveJobScope =
      await this.workflowRunJobScopeWorkspaceService.getCoreWorkflowJobScopeResolver(
        workspaceId,
      );

    // Overlapping sweeps see the same lost runs, so each run is enqueued only by the sweep whose
    // conditional update claims it first: once claimed, the run no longer matches the stale criteria
    const claimedRuns =
      await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
        const workflowRunRepository =
          this.workspaceOrmManager.getRepositoryWithoutPermissionChecks(
            WorkflowRunWorkspaceEntity,
          );
        const claimedRuns: WorkflowRunReference[] = [];

        for (const lostRunsBatch of chunk(lostRuns, QUERY_MAX_RECORDS)) {
          const { generatedMaps } = await workflowRunRepository.update(
            getStaledRunsFindOptions().map((staledRunsWhere) => ({
              ...staledRunsWhere,
              id: In(lostRunsBatch.map(({ id }) => id)),
            })),
            {
              status: WorkflowRunStatus.ENQUEUED,
              enqueuedAt: new Date().toISOString(),
            },
            { columnsToReturn: ['id', 'coreWorkflowId'] },
          );

          claimedRuns.push(
            ...generatedMaps.map(({ id, coreWorkflowId }) => ({
              id,
              coreWorkflowId,
            })),
          );
        }

        return claimedRuns;
      }, buildSystemAuthContext(workspaceId));

    for (const { id: workflowRunId, coreWorkflowId } of claimedRuns) {
      await this.messageQueueService.add<RunWorkflowJobData>(
        RUN_WORKFLOW_JOB_NAME,
        { workflowRunId, workspaceId },
        buildRunWorkflowJobOptions({
          workflowRunId,
          scope: resolveJobScope(coreWorkflowId),
        }),
      );
    }
  }

  async handleStuckStoppingRunsForWorkspace(workspaceId: string) {
    const stuckStoppingRuns = await this.collectRuns({
      workspaceId,
      findOptions: getStuckStoppingRunsFindOptions(),
    });

    for (const { id: workflowRunId } of stuckStoppingRuns) {
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

    const stuckRunningRuns = await this.collectRuns({
      workspaceId,
      findOptions: getStuckRunningRunsFindOptions(),
    });

    if (
      stuckRunningRuns.length === 0 &&
      Object.keys(flaggedRuns).length === 0
    ) {
      return;
    }

    const hasInFlightJob = await this.buildInFlightJobLookup();

    const stillFlaggedRuns: Record<string, string> = {};

    for (const [workflowRunId, detectedAt] of Object.entries(flaggedRuns)) {
      try {
        const workflowRun =
          await this.workflowRunWorkspaceService.getWorkflowRun({
            workflowRunId,
            workspaceId,
          });

        if (!isDefined(workflowRun)) {
          continue;
        }

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

    for (const { id: workflowRunId } of stuckRunningRuns) {
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

  private async buildInFlightJobLookup(): Promise<
    (workflowRunId: string) => boolean
  > {
    const inFlightJobs =
      await this.messageQueueService.getInFlightJobs<RunWorkflowJobData>();

    const workflowRunIdsWithJob = new Set(
      inFlightJobs
        .flatMap((job) => [
          job.data?.workflowRunId,
          isDefined(job.id) ? getQueueJobIdPrefix(job.id) : undefined,
        ])
        .filter(isDefined),
    );

    return (workflowRunId) => workflowRunIdsWithJob.has(workflowRunId);
  }

  private async collectRuns({
    workspaceId,
    findOptions,
  }: {
    workspaceId: string;
    findOptions:
      | FindOptionsWhere<WorkflowRunWorkspaceEntity>
      | FindOptionsWhere<WorkflowRunWorkspaceEntity>[];
  }): Promise<WorkflowRunReference[]> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const workflowRunRepository =
        this.workspaceOrmManager.getRepositoryWithoutPermissionChecks(
          WorkflowRunWorkspaceEntity,
        );

      const runs: WorkflowRunReference[] = [];
      let page: WorkflowRunReference[];

      do {
        page = await workflowRunRepository.find({
          where: findOptions,
          select: { id: true, coreWorkflowId: true },
          order: { createdAt: 'ASC', id: 'ASC' },
          take: QUERY_MAX_RECORDS,
          skip: runs.length,
        });

        runs.push(...page);
      } while (page.length === QUERY_MAX_RECORDS);

      return runs;
    }, authContext);
  }
}
