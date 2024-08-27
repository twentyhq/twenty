import { Scope } from '@nestjs/common';

import { Process } from 'src/engine/integrations/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/integrations/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/integrations/message-queue/message-queue.constants';
import { FieldActorSource } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { WorkflowRunnerWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-runner.workspace-service';
import {
  WorkflowTriggerException,
  WorkflowTriggerExceptionCode,
} from 'src/modules/workflow/workflow-trigger/workflow-trigger.exception';

export type WorkflowEventTriggerJobData = {
  workspaceId: string;
  workflowId: string;
  payload: object;
};

@Processor({ queueName: MessageQueue.workflowQueue, scope: Scope.REQUEST })
export class WorkflowEventTriggerJob {
  constructor(
    private readonly twentyORMManager: TwentyORMManager,
    private readonly workflowRunnerWorkspaceService: WorkflowRunnerWorkspaceService,
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
      throw new WorkflowTriggerException(
        'Workflow has no published version',
        WorkflowTriggerExceptionCode.INTERNAL_ERROR,
      );
    }

    await this.workflowRunnerWorkspaceService.run(
      data.workspaceId,
      workflow.publishedVersionId,
      data.payload,
      {
        source: FieldActorSource.WORKFLOW,
        name: workflow.name,
      },
    );
  }
}
