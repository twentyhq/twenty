import { Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { WorkflowEnqueueAwaitingRunsWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workspace-services/workflow-enqueue-awaiting-runs.workspace-service';

@Processor({ queueName: MessageQueue.workflowQueue, scope: Scope.REQUEST })
export class WorkflowEnqueueAwaitingRunsJob {
  constructor(
    private readonly workflowEnqueueAwaitingRunsWorkspaceService: WorkflowEnqueueAwaitingRunsWorkspaceService,
  ) {}

  @Process(WorkflowEnqueueAwaitingRunsJob.name)
  async handle({ workspaceId }: { workspaceId: string }): Promise<void> {
    await this.workflowEnqueueAwaitingRunsWorkspaceService.enqueueRuns({
      workspaceIds: [workspaceId],
    });
  }
}
