import { InjectRepository } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { Repository } from 'typeorm';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
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

export const WORKFLOW_RUN_ENQUEUE_CRON_PATTERN = '* * * * *';

@Processor(MessageQueue.cronQueue)
export class WorkflowRunEnqueueJob {
  constructor(
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly workflowRunQueueWorkspaceService: WorkflowRunQueueWorkspaceService,
    @InjectMessageQueue(MessageQueue.workflowQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly metricsService: MetricsService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  @Process(WorkflowRunEnqueueJob.name)
  @SentryCronMonitor(
    WorkflowRunEnqueueJob.name,
    WORKFLOW_RUN_ENQUEUE_CRON_PATTERN,
  )
  async handle() {
    const activeWorkspaces = await this.workspaceRepository.find({
      where: {
        activationStatus: WorkspaceActivationStatus.ACTIVE,
      },
    });

    for (const activeWorkspace of activeWorkspaces) {
      try {
        const workflowRunRepository =
          await this.twentyORMGlobalManager.getRepositoryForWorkspace(
            activeWorkspace.id,
            WorkflowRunWorkspaceEntity,
            { shouldBypassPermissionChecks: true },
          );

        const remainingWorkflowRunToEnqueueCount =
          await this.workflowRunQueueWorkspaceService.getRemainingRunsToEnqueueCountFromDatabase(
            activeWorkspace.id,
          );

        if (remainingWorkflowRunToEnqueueCount <= 0) {
          await this.workflowRunQueueWorkspaceService.recomputeWorkflowRunQueuedCount(
            activeWorkspace.id,
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
            activeWorkspace.id,
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
              workspaceId: activeWorkspace.id,
            },
          );
        }

        await this.workflowRunQueueWorkspaceService.recomputeWorkflowRunQueuedCount(
          activeWorkspace.id,
        );
      } catch (error) {
        this.metricsService.incrementCounter({
          key: MetricsKeys.WorkflowRunFailedToEnqueue,
          eventId: activeWorkspace.id,
        });

        console.error(
          'Failed to enqueue workflow runs for workspace',
          activeWorkspace.id,
          error,
        );
      }
    }
  }
}
