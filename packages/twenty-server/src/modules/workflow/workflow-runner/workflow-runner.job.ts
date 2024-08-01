import { Process } from 'src/engine/integrations/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/integrations/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { WorkflowCommonService } from 'src/modules/workflow/common/workflow-common.services';
import { WorkflowRunnerService } from 'src/modules/workflow/workflow-runner/workflow-runner.service';

export type RunWorkflowJobData = {
  workspaceId: string;
  workflowId: string;
  payload: object;
};

@Processor(MessageQueue.workflowQueue)
export class WorkflowRunnerJob {
  constructor(
    private readonly workflowCommonService: WorkflowCommonService,
    private readonly workflowRunnerService: WorkflowRunnerService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  @Process(WorkflowRunnerJob.name)
  async handle({
    workspaceId,
    workflowId,
    payload,
  }: RunWorkflowJobData): Promise<void> {
    const workflowRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkflowWorkspaceEntity>(
        workspaceId,
        'workflow',
      );

    const workflow = await workflowRepository.findOneByOrFail({
      id: workflowId,
    });

    if (!workflow.publishedVersionId) {
      throw new Error('Workflow has no published version');
    }

    const workflowVersion = await this.workflowCommonService.getWorkflowVersion(
      workspaceId,
      workflow.publishedVersionId,
    );

    await this.workflowRunnerService.run({
      action: workflowVersion.trigger.nextAction,
      workspaceId,
      payload,
    });
  }
}
