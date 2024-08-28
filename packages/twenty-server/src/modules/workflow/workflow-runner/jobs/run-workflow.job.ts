import { Scope } from '@nestjs/common';

import { Process } from 'src/engine/integrations/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/integrations/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workflow-common.workspace-service';
import { WorkflowExecutorWorkspaceService } from 'src/modules/workflow/workflow-executor/workflow-executor.workspace-service';
import { WorkflowRunWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run/workflow-run.workspace-service';

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
