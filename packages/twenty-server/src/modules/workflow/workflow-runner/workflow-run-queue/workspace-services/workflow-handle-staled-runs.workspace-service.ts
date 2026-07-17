import { Injectable, Logger } from '@nestjs/common';

import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { StepStatus } from 'twenty-shared/workflow';
import { type FindOptionsWhere } from 'typeorm';

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
import { getStaledRunsFindOptions } from 'src/modules/workflow/workflow-runner/workflow-run-queue/utils/get-staled-runs-find-options.util';
import { getStuckRunningRunsFindOptions } from 'src/modules/workflow/workflow-runner/workflow-run-queue/utils/get-stuck-running-runs-find-options.util';
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

  async handleStuckRunningRunsForWorkspace(workspaceId: string) {
    const stuckRunningRunIds = await this.collectRunIds({
      workspaceId,
      findOptions: getStuckRunningRunsFindOptions(),
    });

    if (stuckRunningRunIds.length === 0) {
      return;
    }

    // A stale RUNNING run whose job is still in the queue is not stuck, only
    // slow: never finalize it while its job is alive. Job ids are prefixed
    // with the workflow run id (see buildRunWorkflowJobOptions).
    const inFlightJobIds = await this.messageQueueService.getInFlightJobIds();

    for (const workflowRunId of stuckRunningRunIds) {
      const hasInFlightJob = inFlightJobIds.some((jobId) =>
        jobId.startsWith(`${workflowRunId}-`),
      );

      if (hasInFlightJob) {
        continue;
      }

      try {
        await this.finalizeStuckRunningRun({ workflowRunId, workspaceId });
      } catch (error) {
        this.logger.error(
          `Failed to finalize stuck running workflow run ${workflowRunId} for workspace ${workspaceId}`,
          error,
        );
      }
    }
  }

  private async finalizeStuckRunningRun({
    workflowRunId,
    workspaceId,
  }: {
    workflowRunId: string;
    workspaceId: string;
  }) {
    const workflowRun =
      await this.workflowRunWorkspaceService.getWorkflowRunOrFail({
        workflowRunId,
        workspaceId,
      });

    if (workflowRun.status !== WorkflowRunStatus.RUNNING) {
      return;
    }

    const stepInfos = workflowRun.state?.stepInfos;
    const steps = workflowRun.state?.flow?.steps;

    if (!isDefined(stepInfos) || !isDefined(steps)) {
      await this.failWorkflowRunWithLostJob({ workflowRun, workspaceId });

      return;
    }

    if (workflowHasRunningSteps({ stepInfos, steps })) {
      await this.failWorkflowRunWithLostJob({ workflowRun, workspaceId });

      return;
    }

    const hasPendingSteps = steps.some(
      (step) => stepInfos[step.id]?.status === StepStatus.PENDING,
    );

    // Pending steps wait on an external resume (delay, form input) that is not
    // driven by a workflowQueue job: those runs are legitimately idle.
    if (hasPendingSteps) {
      return;
    }

    if (workflowShouldKeepRunning({ stepInfos, steps })) {
      // The job was lost between two steps: next steps never started.
      await this.failWorkflowRunWithLostJob({ workflowRun, workspaceId });

      return;
    }

    // The job was lost after the last step but before the final status
    // computation: finalize with the status the run would have ended with.
    await this.workflowRunWorkspaceService.endWorkflowRun({
      workflowRunId,
      workspaceId,
      ...(workflowShouldFail({ stepInfos, steps })
        ? { status: WorkflowRunStatus.FAILED, error: 'WorkflowRun failed' }
        : { status: WorkflowRunStatus.COMPLETED }),
    });
  }

  private async failWorkflowRunWithLostJob({
    workflowRun,
    workspaceId,
  }: {
    workflowRun: WorkflowRunWorkspaceEntity;
    workspaceId: string;
  }) {
    await this.workflowRunWorkspaceService.endWorkflowRun({
      workflowRunId: workflowRun.id,
      workspaceId,
      status: WorkflowRunStatus.FAILED,
      error: `Workflow execution was interrupted: its queue job was lost, likely due to a worker crash or restart. Last progress at ${workflowRun.updatedAt}, detected at ${new Date().toISOString()}.`,
      isSystemError: true,
    });

    await this.metricsService.incrementCounterForEvent({
      key: MetricsKeys.WorkflowRunFailedFromLostJob,
      eventId: workflowRun.id,
      debugLog: `[Workflow Run Lost Job] Workflow run ${workflowRun.id} in workspace ${workspaceId} failed because its queue job was lost`,
    });
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
