import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import {
  WorkflowRunStatus,
  type WorkflowRunWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowThrottlingWorkspaceService } from 'src/modules/workflow/workflow-runner/workflow-run-queue/workspace-services/workflow-throttling.workspace-service';
import { WorkflowStepWaitWorkspaceService } from 'src/modules/workflow/workflow-wait/services/workflow-step-wait.workspace-service';

const WORKFLOW_RUN_DELETION_BATCH_SIZE = 200;

const WAITING_WORKFLOW_RUN_STATUSES = [
  WorkflowRunStatus.RUNNING,
  WorkflowRunStatus.STOPPING,
];

@Injectable()
export class WorkflowDeletionCleanupWorkspaceService {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workflowStepWaitWorkspaceService: WorkflowStepWaitWorkspaceService,
    private readonly workflowThrottlingWorkspaceService: WorkflowThrottlingWorkspaceService,
  ) {}

  async cleanUpDeletedWorkflows({
    workspaceId,
    coreWorkflowIds,
  }: {
    workspaceId: string;
    coreWorkflowIds: string[];
  }): Promise<void> {
    await this.workspaceOrmManager.executeInWorkspaceContext(
      () => this.deleteRuns({ workspaceId, coreWorkflowIds }),
      buildSystemAuthContext(workspaceId),
    );
    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'workflowAutomatedTriggerMaps',
    ]);
  }

  private async deleteRuns({
    workspaceId,
    coreWorkflowIds,
  }: {
    workspaceId: string;
    coreWorkflowIds: string[];
  }): Promise<void> {
    const workflowRunRepository =
      this.workspaceOrmManager.getRepository<WorkflowRunWorkspaceEntity>(
        'workflowRun',
        { shouldBypassPermissionChecks: true },
      );

    const findRunBatch = () =>
      workflowRunRepository.find({
        where: { coreWorkflowId: In(coreWorkflowIds) },
        select: { id: true, status: true },
        take: WORKFLOW_RUN_DELETION_BATCH_SIZE,
        withDeleted: true,
      });

    let batchRuns = await findRunBatch();

    while (batchRuns.length > 0) {
      await this.workflowStepWaitWorkspaceService.cancelWaitsOfRuns({
        workspaceId,
        workflowRunIds: batchRuns
          .filter(({ status }) =>
            WAITING_WORKFLOW_RUN_STATUSES.includes(status),
          )
          .map(({ id }) => id),
      });

      const deletedRuns: Pick<
        WorkflowRunWorkspaceEntity,
        'status' | 'deletedAt'
      >[] = (
        await workflowRunRepository.delete(
          batchRuns.map(({ id }) => id),
          { columnsToReturn: ['status', 'deletedAt'] },
        )
      ).raw;

      const removedNotStartedRunCount = deletedRuns.filter(
        ({ status, deletedAt }) =>
          status === WorkflowRunStatus.NOT_STARTED && !isDefined(deletedAt),
      ).length;

      if (removedNotStartedRunCount > 0) {
        await this.workflowThrottlingWorkspaceService.decreaseWorkflowRunNotStartedCount(
          workspaceId,
          removedNotStartedRunCount,
        );
      }

      batchRuns = await findRunBatch();
    }
  }
}
