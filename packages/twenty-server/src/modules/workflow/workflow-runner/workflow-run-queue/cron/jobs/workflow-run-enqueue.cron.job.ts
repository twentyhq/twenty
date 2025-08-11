import { Logger } from '@nestjs/common';
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
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import {
  WorkflowRunStatus,
  WorkflowRunWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import {
  RunWorkflowJob,
  type RunWorkflowJobData,
} from 'src/modules/workflow/workflow-runner/jobs/run-workflow.job';
import { WORKFLOW_RUN_QUEUE_THROTTLE_LIMIT } from 'src/modules/workflow/workflow-runner/workflow-run-queue/constants/workflow-run-queue-throttle-limit';
import { WorkflowRunQueueWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workspace-services/workflow-run-queue.workspace-service';

export const WORKFLOW_RUN_ENQUEUE_CRON_PATTERN = '* * * * *';

@Processor(MessageQueue.cronQueue)
export class WorkflowRunEnqueueJob {
  private readonly logger = new Logger(WorkflowRunEnqueueJob.name);

  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly workflowRunQueueWorkspaceService: WorkflowRunQueueWorkspaceService,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
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

    const mainDataSource =
      await this.workspaceDataSourceService.connectToMainDataSource();

    for (const activeWorkspace of activeWorkspaces) {
      let currentlyEnqueuedWorkflowRunCount = 0;

      try {
        const workflowRunRepository =
          await this.twentyORMGlobalManager.getRepositoryForWorkspace(
            activeWorkspace.id,
            WorkflowRunWorkspaceEntity,
            { shouldBypassPermissionChecks: true },
          );

        currentlyEnqueuedWorkflowRunCount = await workflowRunRepository.count({
          where: {
            status: WorkflowRunStatus.ENQUEUED,
          },
        });

        await this.workflowRunQueueWorkspaceService.setWorkflowRunQueuedCount(
          activeWorkspace.id,
          currentlyEnqueuedWorkflowRunCount,
        );

        const remainingWorkflowRunToEnqueueCount =
          WORKFLOW_RUN_QUEUE_THROTTLE_LIMIT - currentlyEnqueuedWorkflowRunCount;

        if (remainingWorkflowRunToEnqueueCount <= 0) {
          continue;
        }

        const schemaName = getWorkspaceSchemaName(activeWorkspace.id);

        // Using raw query to avoid storing repository in cache
        const workflowRuns = await mainDataSource.query(
          `SELECT id FROM ${schemaName}."workflowRun" WHERE status = '${WorkflowRunStatus.NOT_STARTED}' ORDER BY "createdAt" ASC LIMIT ${remainingWorkflowRunToEnqueueCount}`,
        );

        const workflowRunsToEnqueueCount = Math.min(
          remainingWorkflowRunToEnqueueCount,
          workflowRuns.length,
        );

        if (workflowRunsToEnqueueCount <= 0) {
          continue;
        }

        const workflowRunIds = workflowRuns.map(
          (workflowRun: WorkflowRunWorkspaceEntity) => workflowRun.id,
        );

        await workflowRunRepository.update(workflowRunIds, {
          enqueuedAt: new Date().toISOString(),
          status: WorkflowRunStatus.ENQUEUED,
        });

        for (const workflowRunId of workflowRunIds) {
          await this.workflowRunQueueWorkspaceService.increaseWorkflowRunQueuedCount(
            activeWorkspace.id,
          );

          await this.messageQueueService.add<RunWorkflowJobData>(
            RunWorkflowJob.name,
            {
              workflowRunId,
              workspaceId: activeWorkspace.id,
            },
          );
        }
      } catch (error) {
        this.logger.error(
          `Error enqueuing workflow runs for workspace ${activeWorkspace.id}`,
          error,
        );

        this.metricsService.incrementCounter({
          key: MetricsKeys.WorkflowRunFailedToEnqueue,
          eventId: activeWorkspace.id,
        });
      }
    }
  }
}
