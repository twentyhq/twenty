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
import {
  RunWorkflowJob,
  RunWorkflowJobData,
} from 'src/modules/workflow/workflow-runner/jobs/run-workflow.job';
import { WorkflowRunQueueWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workspace-services/workflow-run-queue.workspace-service';

@Injectable()
export class WorkflowRunEnqueueWorkspaceService {
  private readonly logger = new Logger(WorkflowRunEnqueueWorkspaceService.name);
  constructor(
    private readonly workflowRunQueueWorkspaceService: WorkflowRunQueueWorkspaceService,
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

        const remainingWorkflowRunToEnqueueCount =
          await this.workflowRunQueueWorkspaceService.getRemainingRunsToEnqueueCountFromDatabase(
            workspaceId,
          );

        if (remainingWorkflowRunToEnqueueCount <= 0) {
          await this.workflowRunQueueWorkspaceService.recomputeWorkflowRunQueuedCount(
            workspaceId,
          );

          continue;
        }

        const workflowRunsToEnqueue = await workflowRunRepository.find({
          where: {
            status: WorkflowRunStatus.NOT_STARTED,
          },
          order: {
            createdAt: 'ASC',
          },
          take: remainingWorkflowRunToEnqueueCount,
        });

        if (workflowRunsToEnqueue.length <= 0) {
          await this.workflowRunQueueWorkspaceService.recomputeWorkflowRunQueuedCount(
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

        await this.workflowRunQueueWorkspaceService.recomputeWorkflowRunQueuedCount(
          workspaceId,
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
