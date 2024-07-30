import { Processor } from 'src/engine/integrations/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { Process } from 'src/engine/integrations/message-queue/decorators/process.decorator';
import { WorkflowRunService } from 'src/modules/workflow/workflow-runner/services/workflow-run.service';
import { WorkflowCommonService } from 'src/modules/workflow/common/services/workflow-common.services';

type RunWorkflowJobData = { workspaceId: string; workflowVersionId: string };

@Processor(MessageQueue.workflowQueue)
export class WorkflowRunJob {
  constructor(
    private readonly workflowCommonService: WorkflowCommonService,
    private readonly workflowRunService: WorkflowRunService,
  ) {}

  @Process(WorkflowRunJob.name)
  async handle({
    workspaceId,
    workflowVersionId,
  }: RunWorkflowJobData): Promise<void> {
    const workflowVersion = await this.workflowCommonService.getWorkflowVersion(
      workspaceId,
      workflowVersionId,
    );

    await this.workflowRunService.run({
      action: workflowVersion.trigger.nextAction,
      workspaceId,
      payload: workflowVersion.trigger.input,
    });
  }
}
