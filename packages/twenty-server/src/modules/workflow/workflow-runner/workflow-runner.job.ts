import { Process } from 'src/engine/integrations/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/integrations/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowCommonService } from 'src/modules/workflow/common/workflow-common.services';
import { WorkflowRunnerService } from 'src/modules/workflow/workflow-runner/workflow-runner.service';
import { WorkflowStatusService } from 'src/modules/workflow/workflow-status/workflow-status.service';

export type RunWorkflowJobData = {
  workspaceId: string;
  workflowVersionId: string;
  payload: object;
};

@Processor(MessageQueue.workflowQueue)
export class WorkflowRunnerJob {
  constructor(
    private readonly workflowCommonService: WorkflowCommonService,
    private readonly workflowRunnerService: WorkflowRunnerService,
    private readonly workflowStatusService: WorkflowStatusService,
  ) {}

  @Process(WorkflowRunnerJob.name)
  async handle({
    workspaceId,
    workflowVersionId,
    payload,
  }: RunWorkflowJobData): Promise<void> {
    await this.workflowStatusService.startWorkflowRun(
      workspaceId,
      workflowVersionId,
    );

    const workflowVersion = await this.workflowCommonService.getWorkflowVersion(
      workspaceId,
      workflowVersionId,
    );

    const output = await this.workflowRunnerService.run({
      action: workflowVersion.trigger.nextAction,
      workspaceId,
      payload,
    });

    await this.workflowStatusService.endWorkflowRun(
      workspaceId,
      workflowVersionId,
      output.error ? WorkflowRunStatus.FAILED : WorkflowRunStatus.SUCCEEDED,
    );
  }
}
