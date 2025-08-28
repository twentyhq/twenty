import { IsNull, LessThan, Or } from 'typeorm';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import {
  WorkflowRunStatus,
  WorkflowRunWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowRunQueueWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workspace-services/workflow-run-queue.workspace-service';

export type WorkflowHandleStaledRunsPerWorkspaceJobData = {
  workspaceId: string;
};

@Processor(MessageQueue.workflowQueue)
export class WorkflowHandleStaledRunsPerWorkspaceJob {
  constructor(
    private readonly workflowRunQueueWorkspaceService: WorkflowRunQueueWorkspaceService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  @Process(WorkflowHandleStaledRunsPerWorkspaceJob.name)
  async handle(data: WorkflowHandleStaledRunsPerWorkspaceJobData) {
    const { workspaceId } = data;

    const workflowRunRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        WorkflowRunWorkspaceEntity,
        { shouldBypassPermissionChecks: true },
      );

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const staledWorkflowRuns = await workflowRunRepository.find({
      where: {
        status: WorkflowRunStatus.ENQUEUED,
        enqueuedAt: Or(LessThan(oneHourAgo), IsNull()),
      },
    });

    if (staledWorkflowRuns.length <= 0) {
      return;
    }

    await workflowRunRepository.update(
      staledWorkflowRuns.map((workflowRun) => workflowRun.id),
      {
        enqueuedAt: null,
        status: WorkflowRunStatus.NOT_STARTED,
      },
    );

    await this.workflowRunQueueWorkspaceService.recomputeWorkflowRunQueuedCount(
      workspaceId,
    );
  }
}
