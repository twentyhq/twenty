import { Processor } from 'src/engine/integrations/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { Process } from 'src/engine/integrations/message-queue/decorators/process.decorator';
import { WorkflowRunnerService } from 'src/modules/workflow/workflow-runner/workflow-runner.service';
import { WorkflowCommonService } from 'src/modules/workflow/common/workflow-common.services';

type RunWorkflowJobData = { workspaceId: string; workflowVersionId: string };

@Processor(MessageQueue.workflowQueue)
export class WorkflowRunnerJob {
  constructor(
    private readonly workflowCommonService: WorkflowCommonService,
    private readonly workflowRunnerService: WorkflowRunnerService,
  ) {}

  @Process(WorkflowRunnerJob.name)
  async handle({
    workspaceId,
    workflowVersionId,
  }: RunWorkflowJobData): Promise<void> {
    const workflowVersion = await this.workflowCommonService.getWorkflowVersion(
      workspaceId,
      workflowVersionId,
    );

    await this.workflowRunnerService.run({
      action: workflowVersion.trigger.nextAction,
      workspaceId,
      payload: workflowVersion.trigger.input,
    });
  }
}
