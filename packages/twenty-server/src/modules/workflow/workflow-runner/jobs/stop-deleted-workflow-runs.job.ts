import { Logger, Scope } from '@nestjs/common';

import { In } from 'typeorm';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { STOPPABLE_WORKFLOW_RUN_STATUSES } from 'src/modules/workflow/workflow-runner/constants/stoppable-workflow-run-statuses.constant';
import { WorkflowRunnerWorkspaceService } from 'src/modules/workflow/workflow-runner/workspace-services/workflow-runner.workspace-service';

export type StopDeletedWorkflowRunsJobData = {
  workspaceId: string;
  coreWorkflowIds: string[];
};

@Processor({
  queueName: MessageQueue.deleteCascadeQueue,
  scope: Scope.REQUEST,
})
export class StopDeletedWorkflowRunsJob {
  private readonly logger = new Logger(StopDeletedWorkflowRunsJob.name);

  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly workflowRunnerWorkspaceService: WorkflowRunnerWorkspaceService,
  ) {}

  @Process(StopDeletedWorkflowRunsJob.name)
  async handle({
    workspaceId,
    coreWorkflowIds,
  }: StopDeletedWorkflowRunsJobData): Promise<void> {
    await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
      const workflowRuns = await this.workspaceOrmManager
        .getRepository<WorkflowRunWorkspaceEntity>('workflowRun', {
          shouldBypassPermissionChecks: true,
        })
        .find({
          where: {
            coreWorkflowId: In(coreWorkflowIds),
            status: In(STOPPABLE_WORKFLOW_RUN_STATUSES),
          },
          select: { id: true },
        });

      const failedWorkflowRunIds: string[] = [];

      for (const { id } of workflowRuns) {
        try {
          await this.workflowRunnerWorkspaceService.stopWorkflowRun(
            workspaceId,
            id,
          );
        } catch (error) {
          this.logger.error(
            `Failed to stop workflow run ${id} of a deleted workflow in workspace ${workspaceId}: ${error instanceof Error ? error.message : String(error)}`,
          );
          failedWorkflowRunIds.push(id);
        }
      }

      if (failedWorkflowRunIds.length > 0) {
        throw new Error(
          `Failed to stop ${failedWorkflowRunIds.length} of ${workflowRuns.length} workflow runs of deleted workflows in workspace ${workspaceId}`,
        );
      }
    }, buildSystemAuthContext(workspaceId));
  }
}
