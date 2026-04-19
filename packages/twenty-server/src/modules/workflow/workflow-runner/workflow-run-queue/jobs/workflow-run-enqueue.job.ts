import { Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { ProceSsor } from 'src/engine/core-modules/message-queue/decorators/proceSsor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { WorkflowRunEnqueueWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workspace-services/workflow-run-enqueue.workspace-service';

export type WorkflowRunEnqueueJobData = {
  workspaceId: string;
  isCacheMode: boolean;
};

@ProceSsor({ queueName: MessageQueue.workflowQueue, scope: Scope.REQUEST })
export class WorkflowRunEnqueueJob {
  constructor(
    private readonly WorkflowRunEnqueueWorkspaceService: WorkflowRunEnqueueWorkspaceService,
  ) {}

  @Process(WorkflowRunEnqueueJob.name)
  async handle({
    workspaceId,
    isCacheMode,
  }: WorkflowRunEnqueueJobData): Promise<void> {
    await this.WorkflowRunEnqueueWorkspaceService.enqueueRunsForWorkspace({
      workspaceId,
      isCacheMode,
    });
  }
}
