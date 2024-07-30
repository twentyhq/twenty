import { Processor } from 'src/engine/integrations/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { Process } from 'src/engine/integrations/message-queue/decorators/process.decorator';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { WorkflowRunService } from 'src/modules/workflow/workflow-runner/services/workflow-run.service';

type RunWorkflowJobData = { workspaceId: string; workflowVersionId: string };

@Processor(MessageQueue.workflowQueue)
export class WorkflowRunJob {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly workflowRunService: WorkflowRunService,
  ) {}

  @Process(WorkflowRunJob.name)
  async handle({
    workspaceId,
    workflowVersionId,
  }: RunWorkflowJobData): Promise<void> {
    const workflowVersionRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkflowVersionWorkspaceEntity>(
        workspaceId,
        'workflowVersion',
      );

    const workflowVersion = await workflowVersionRepository.findOne({
      where: {
        id: workflowVersionId,
      },
    });

    if (!workflowVersion) {
      return;
    }

    if (!workflowVersion.trigger) {
      return;
    }

    await this.workflowRunService.run({
      action: workflowVersion.trigger.nextAction,
      workspaceId,
      payload: workflowVersion.trigger.input,
    });
  }
}
