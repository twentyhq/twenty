import { Injectable, Logger } from '@nestjs/common';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import {
  WorkflowRunStatus,
  WorkflowRunWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { RunWorkflowJob } from 'src/modules/workflow/workflow-runner/jobs/run-workflow.job';
import { type RunWorkflowJobData } from 'src/modules/workflow/workflow-runner/types/run-workflow-job-data.type';
import { WorkflowNotStartedRunsWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workspace-services/workflow-not-started-runs.workspace-service';

@Injectable()
export class WorkflowEnqueueAwaitingRunsWorkspaceService {
  private readonly logger = new Logger(
    WorkflowEnqueueAwaitingRunsWorkspaceService.name,
  );
  constructor(
    private readonly workflowNotStartedRunsWorkspaceService: WorkflowNotStartedRunsWorkspaceService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    @InjectMessageQueue(MessageQueue.workflowQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly metricsService: MetricsService,
  ) {}

  async enqueueRuns({ workspaceIds }: { workspaceIds: string[] }) {
    for (const workspaceId of workspaceIds) {
      try {
        const workflowRunRepository =
          await this.twentyORMGlobalManager.getRepositoryForWorkspace(
            workspaceId,
            WorkflowRunWorkspaceEntity,
            { shouldBypassPermissionChecks: true },
          );

        const notStartedRunsCount =
          await this.workflowNotStartedRunsWorkspaceService.getNotStartedRunsCountFromDatabase(
            workspaceId,
          );

        if (notStartedRunsCount <= 0) {
          await this.workflowNotStartedRunsWorkspaceService.recomputeWorkflowRunNotStartedCount(
            workspaceId,
          );

          continue;
        }

        const remainingWorkflowRunToEnqueueCount =
          await this.workflowNotStartedRunsWorkspaceService.getRemainingRunsToEnqueueCount(
            workspaceId,
          );

        const workflowRunsToEnqueue = await workflowRunRepository.find({
          where: {
            status: WorkflowRunStatus.NOT_STARTED,
          },
          select: {
            id: true,
            status: true,
          },
          order: {
            createdAt: 'ASC',
          },
          take: remainingWorkflowRunToEnqueueCount,
        });

        if (workflowRunsToEnqueue.length <= 0) {
          await this.workflowNotStartedRunsWorkspaceService.recomputeWorkflowRunNotStartedCount(
            workspaceId,
          );

          continue;
        }

        const workflowRunIds = workflowRunsToEnqueue.map(
          (workflowRun: WorkflowRunWorkspaceEntity) => workflowRun.id,
        );

        await workflowRunRepository.update(workflowRunIds, {
          enqueuedAt: new Date().toISOString(),
          status: WorkflowRunStatus.ENQUEUED,
        });

        for (const workflowRunId of workflowRunIds) {
          await this.messageQueueService.add<RunWorkflowJobData>(
            RunWorkflowJob.name,
            {
              workflowRunId,
              workspaceId,
            },
          );
        }

        await this.workflowNotStartedRunsWorkspaceService.decreaseWorkflowRunNotStartedCount(
          workspaceId,
          workflowRunIds.length,
        );
      } catch (error) {
        this.metricsService.incrementCounter({
          key: MetricsKeys.WorkflowRunFailedToEnqueue,
          eventId: workspaceId,
        });

        this.logger.error(
          `Failed to enqueue workflow runs for workspace: ${workspaceId}`,
          error,
        );
      }
    }
  }
}
