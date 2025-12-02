import { Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { WorkflowRunEnqueueWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workspace-services/workflow-run-enqueue.workspace-service';

export type WorkflowRunEnqueueJobData = {
  workspaceId: string;
  workflowRunId?: string;
  isCacheMode: boolean;
};

@Processor({ queueName: MessageQueue.workflowQueue, scope: Scope.REQUEST })
export class WorkflowRunEnqueueJob {
  constructor(
    private readonly WorkflowRunEnqueueWorkspaceService: WorkflowRunEnqueueWorkspaceService,
  ) {}

  @Process(WorkflowRunEnqueueJob.name)
  async handle({
    workspaceId,
    workflowRunId,
    isCacheMode,
  }: WorkflowRunEnqueueJobData): Promise<void> {
    await this.WorkflowRunEnqueueWorkspaceService.enqueueRunsForWorkspace({
      workspaceId,
      priorityWorkflowRunId: workflowRunId,
      isCacheMode,
    });
  }
}
