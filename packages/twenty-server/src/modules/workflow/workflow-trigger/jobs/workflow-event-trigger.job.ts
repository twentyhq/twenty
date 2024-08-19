import { Scope } from '@nestjs/common';

import { InjectMessageQueue } from 'src/engine/integrations/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/integrations/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/integrations/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/integrations/message-queue/services/message-queue.service';
import { FieldActorSource } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import {
  RunWorkflowJobData,
  WorkflowRunnerJob,
} from 'src/modules/workflow/workflow-runner/workflow-runner.job';
import { WorkflowStatusWorkspaceService } from 'src/modules/workflow/workflow-status/workflow-status.workspace-service';

export type WorkflowEventTriggerJobData = {
  workspaceId: string;
  workflowId: string;
  payload: object;
};

@Processor({ queueName: MessageQueue.workflowQueue, scope: Scope.REQUEST })
export class WorkflowEventTriggerJob {
  constructor(
    @InjectMessageQueue(MessageQueue.workflowQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly twentyORMManager: TwentyORMManager,
    private readonly workflowStatusWorkspaceService: WorkflowStatusWorkspaceService,
  ) {}

  @Process(WorkflowEventTriggerJob.name)
  async handle(data: WorkflowEventTriggerJobData): Promise<void> {
    const workflowRepository =
      await this.twentyORMManager.getRepository<WorkflowWorkspaceEntity>(
        'workflow',
      );

    const workflow = await workflowRepository.findOneByOrFail({
      id: data.workflowId,
    });

    if (!workflow.publishedVersionId) {
      throw new Error('Workflow has no published version');
    }

    const workflowRunId =
      await this.workflowStatusWorkspaceService.createWorkflowRun(
        workflow.publishedVersionId,
        {
          source: FieldActorSource.WORKFLOW,
          name: workflow.name,
        },
      );

    this.messageQueueService.add<RunWorkflowJobData>(WorkflowRunnerJob.name, {
      workspaceId: data.workspaceId,
      workflowVersionId: workflow.publishedVersionId,
      payload: data.payload,
      workflowRunId,
    });
  }
}
