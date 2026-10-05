import { Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { WorkflowDeletionCleanupWorkspaceService } from 'src/modules/workflow/workflow-deletion/services/workflow-deletion-cleanup.workspace-service';

export type CleanUpDeletedWorkflowsJobData = {
  workspaceId: string;
  coreWorkflowIds: string[];
};

@Processor({
  queueName: MessageQueue.deleteCascadeQueue,
  scope: Scope.REQUEST,
})
export class CleanUpDeletedWorkflowsJob {
  constructor(
    private readonly workflowDeletionCleanupWorkspaceService: WorkflowDeletionCleanupWorkspaceService,
  ) {}

  @Process(CleanUpDeletedWorkflowsJob.name)
  async handle({
    workspaceId,
    coreWorkflowIds,
  }: CleanUpDeletedWorkflowsJobData): Promise<void> {
    await this.workflowDeletionCleanupWorkspaceService.cleanUpDeletedWorkflows({
      workspaceId,
      coreWorkflowIds,
    });
  }
}
