import { Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowExecutorWorkspaceService } from 'src/modules/workflow/workflow-executor/workspace-services/workflow-executor.workspace-service';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workspace-services/workflow-run.workspace-service';

export type RunWorkflowJobData = {
  workspaceId: string;
  workflowVersionId: string;
  workflowRunId: string;
  payload: object;
};

@Processor({ queueName: MessageQueue.workflowQueue, scope: Scope.REQUEST })
export class RunWorkflowJob {
  constructor(
    private readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
    private readonly workflowExecutorWorkspaceService: WorkflowExecutorWorkspaceService,
    private readonly workflowRunWorkspaceService: WorkflowRunWorkspaceService,
  ) {}

  @Process(RunWorkflowJob.name)
  async handle({
    workflowVersionId,
    workflowRunId,
    payload,
  }: RunWorkflowJobData): Promise<void> {
    await this.workflowRunWorkspaceService.startWorkflowRun(workflowRunId);

    const workflowVersion =
      await this.workflowCommonWorkspaceService.getWorkflowVersionOrFail(
        workflowVersionId,
      );

    try {
      await this.workflowExecutorWorkspaceService.execute({
        currentStepIndex: 0,
        steps: workflowVersion.steps || [],
        payload,
      });

      await this.workflowRunWorkspaceService.endWorkflowRun(
        workflowRunId,
        WorkflowRunStatus.COMPLETED,
      );
    } catch (error) {
      await this.workflowRunWorkspaceService.endWorkflowRun(
        workflowRunId,
        WorkflowRunStatus.FAILED,
      );

      throw error;
    }
  }
}
