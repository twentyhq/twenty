import { Scope } from '@nestjs/common';

import { Process } from 'src/engine/integrations/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/integrations/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workflow-common.workspace-service';
import { WorkflowRunnerWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-runner.workspace-service';
import { WorkflowStatusWorkspaceService } from 'src/modules/workflow/workflow-status/workflow-status.workspace-service';

export type RunWorkflowJobData = {
  workspaceId: string;
  workflowVersionId: string;
  workflowRunId: string;
  payload: object;
};

@Processor({ queueName: MessageQueue.workflowQueue, scope: Scope.REQUEST })
export class WorkflowRunnerJob {
  constructor(
    private readonly workflowCommonWorkspaceService: WorkflowCommonWorkspaceService,
    private readonly workflowRunnerWorkspaceService: WorkflowRunnerWorkspaceService,
    private readonly workflowStatusWorkspaceService: WorkflowStatusWorkspaceService,
  ) {}

  @Process(WorkflowRunnerJob.name)
  async handle({
    workflowVersionId,
    workflowRunId,
    payload,
  }: RunWorkflowJobData): Promise<void> {
    await this.workflowStatusWorkspaceService.startWorkflowRun(workflowRunId);

    const workflowVersion =
      await this.workflowCommonWorkspaceService.getWorkflowVersion(
        workflowVersionId,
      );

    try {
      await this.workflowRunnerWorkspaceService.run({
        action: workflowVersion.trigger.nextAction,
        payload,
      });

      await this.workflowStatusWorkspaceService.endWorkflowRun(
        workflowRunId,
        WorkflowRunStatus.COMPLETED,
      );
    } catch (error) {
      await this.workflowStatusWorkspaceService.endWorkflowRun(
        workflowRunId,
        WorkflowRunStatus.FAILED,
      );

      throw error;
    }
  }
}
