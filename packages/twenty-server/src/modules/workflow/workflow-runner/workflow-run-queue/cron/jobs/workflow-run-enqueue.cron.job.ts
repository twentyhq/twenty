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
  RunWorkflowJobData,
} from 'src/modules/workflow/workflow-runner/jobs/run-workflow.job';
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
      let enqueuedWorkflowRunCount = 0;

      try {
        const remainingWorkflowRunCount =
          await this.workflowRunQueueWorkspaceService.getRemainingRunsToEnqueueCount(
            activeWorkspace.id,
          );

        if (remainingWorkflowRunCount <= 0) {
          continue;
        }

        const schemaName = getWorkspaceSchemaName(activeWorkspace.id);

        // Using raw query to avoid storing repository in cache
        const workflowRuns = await mainDataSource.query(
          `SELECT id FROM ${schemaName}."workflowRun" WHERE status = '${WorkflowRunStatus.NOT_STARTED}' ORDER BY "createdAt" ASC`,
        );

        const workflowRunsToEnqueueCount = Math.min(
          remainingWorkflowRunCount,
          workflowRuns.length,
        );

        if (workflowRunsToEnqueueCount <= 0) {
          continue;
        }

        const workflowRunRepository =
          await this.twentyORMGlobalManager.getRepositoryForWorkspace(
            activeWorkspace.id,
            WorkflowRunWorkspaceEntity,
            { shouldBypassPermissionChecks: true },
          );

        for (
          let runIndex = 0;
          runIndex < workflowRunsToEnqueueCount;
          runIndex++
        ) {
          const workflowRunId = workflowRuns[runIndex].id;

          await this.messageQueueService.add<RunWorkflowJobData>(
            RunWorkflowJob.name,
            {
              workflowRunId,
              workspaceId: activeWorkspace.id,
            },
          );

          await workflowRunRepository.update(workflowRunId, {
            status: WorkflowRunStatus.ENQUEUED,
          });

          enqueuedWorkflowRunCount++;
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
      } finally {
        if (enqueuedWorkflowRunCount > 0) {
          await this.workflowRunQueueWorkspaceService.increaseWorkflowRunQueuedCount(
            activeWorkspace.id,
            enqueuedWorkflowRunCount,
          );
        }
      }
    }
  }
}
