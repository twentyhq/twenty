import { Scope } from '@nestjs/common';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { type ResumeDelayedJobData } from 'src/modules/workflow/workflow-executor/workflow-actions/delay/delay.workflow-action';
import {
  RunWorkflowJob,
  type RunWorkflowJobData,
} from 'src/modules/workflow/workflow-runner/jobs/run-workflow.job';
import { WorkflowRunQueueWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workspace-services/workflow-run-queue.workspace-service';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

@Processor({ queueName: MessageQueue.workflowQueue, scope: Scope.REQUEST })
export class ResumeDelayedJob {
  constructor(
    @InjectMessageQueue(MessageQueue.workflowQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly workflowRunWorkspaceService: WorkflowRunWorkspaceService,
    private readonly workflowRunQueueWorkspaceService: WorkflowRunQueueWorkspaceService,
  ) {}

  @Process(ResumeDelayedJob.name)
  async handle({
    workspaceId,
    workflowRunId,
    stepId,
  }: ResumeDelayedJobData): Promise<void> {
    try {
      const workflowRun = await this.workflowRunWorkspaceService.getWorkflowRun(
        {
          workflowRunId,
          workspaceId,
        },
      );

      if (!workflowRun) {
        return;
      }

      if (workflowRun.status !== WorkflowRunStatus.RUNNING) {
        return;
      }

      await this.messageQueueService.add<RunWorkflowJobData>(
        RunWorkflowJob.name,
        {
          workspaceId,
          workflowRunId,
          lastExecutedStepId: stepId,
        },
      );

      await this.workflowRunQueueWorkspaceService.increaseWorkflowRunQueuedCount(
        workspaceId,
      );
    } catch (error) {
      await this.workflowRunWorkspaceService.endWorkflowRun({
        workflowRunId,
        workspaceId,
        status: WorkflowRunStatus.FAILED,
        error:
          error instanceof Error
            ? error.message
            : 'Unknown error during delay resume',
      });
    }
  }
}
