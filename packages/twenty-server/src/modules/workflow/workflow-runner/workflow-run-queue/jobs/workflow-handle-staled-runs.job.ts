import { Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { WorkflowHandleStaledRunsWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workspace-services/workflow-handle-staled-runs.workspace-service';

export type WorkflowHandleStaledRunsJobData = {
  workspaceId: string;
};

@Processor({ queueName: MessageQueue.workflowQueue, scope: Scope.REQUEST })
export class WorkflowHandleStaledRunsJob {
  constructor(
    private readonly workflowHandleStaledRunsWorkspaceService: WorkflowHandleStaledRunsWorkspaceService,
  ) {}

  @Process(WorkflowHandleStaledRunsJob.name)
  async handle({
    workspaceId,
  }: WorkflowHandleStaledRunsJobData): Promise<void> {
    await this.workflowHandleStaledRunsWorkspaceService.handleStaledRunsForWorkspace(
      workspaceId,
    );
  }
}
