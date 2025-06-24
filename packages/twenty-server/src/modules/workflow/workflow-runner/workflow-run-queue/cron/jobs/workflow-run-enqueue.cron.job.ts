import { InjectRepository } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { Repository } from 'typeorm';

import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import {
  RunWorkflowJob,
  RunWorkflowJobData,
} from 'src/modules/workflow/workflow-runner/jobs/run-workflow.job';
import { WorkflowRunQueueWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workspace-services/workflow-run-queue.workspace-service';

export const WORKFLOW_RUN_ENQUEUE_CRON_PATTERN = '* * * * *';

@Processor(MessageQueue.cronQueue)
export class WorkflowRunEnqueueJob {
  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly workflowRunQueueWorkspaceService: WorkflowRunQueueWorkspaceService,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    @InjectMessageQueue(MessageQueue.workflowQueue)
    private readonly messageQueueService: MessageQueueService,
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
      const remainingWorkflowRunCount =
        await this.workflowRunQueueWorkspaceService.getRemainingRunsToEnqueueCount(
          activeWorkspace.id,
        );

      if (remainingWorkflowRunCount <= 0) {
        continue;
      }

      const schemaName = this.workspaceDataSourceService.getSchemaName(
        activeWorkspace.id,
      );

      const workflowRuns = await mainDataSource.query(
        `SELECT * FROM ${schemaName}."workflowRun" WHERE status = '${WorkflowRunStatus.NOT_STARTED}'`,
      );

      const workflowRunsToEnqueueCount = Math.min(
        remainingWorkflowRunCount,
        workflowRuns.length,
      );

      if (workflowRunsToEnqueueCount <= 0) {
        continue;
      }

      await this.workflowRunQueueWorkspaceService.increaseWorkflowRunQueuedCount(
        activeWorkspace.id,
        workflowRunsToEnqueueCount,
      );

      for (
        let runIndex = 0;
        runIndex < workflowRunsToEnqueueCount;
        runIndex++
      ) {
        const workflowRunId = workflowRuns[runIndex].id;

        await mainDataSource.query(
          `UPDATE ${schemaName}."workflowRun" SET status = '${WorkflowRunStatus.ENQUEUED}' WHERE id = '${workflowRunId}'`,
        );

        await this.messageQueueService.add<RunWorkflowJobData>(
          RunWorkflowJob.name,
          {
            workflowRunId,
            workspaceId: activeWorkspace.id,
          },
        );
      }
    }
  }
}
