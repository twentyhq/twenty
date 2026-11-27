import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';

const WORKFLOW_RUN_DELETION_BATCH_SIZE = 200;

@Injectable()
export class WorkflowDeletionCleanupWorkspaceService {
  constructor(private readonly workspaceOrmManager: WorkspaceOrmManager) {}

  async deleteWorkflowRuns({
    workspaceId,
    coreWorkflowId,
    coreWorkflowVersionId,
  }: {
    workspaceId: string;
    coreWorkflowId: string;
    coreWorkflowVersionId?: string;
  }): Promise<void> {
    await this.workspaceOrmManager.executeInWorkspaceContext(
      () =>
        this.deleteRuns(
          isDefined(coreWorkflowVersionId)
            ? { coreWorkflowVersionId }
            : { coreWorkflowId },
        ),
      buildSystemAuthContext(workspaceId),
    );
  }

  private async deleteRuns(
    where: { coreWorkflowId: string } | { coreWorkflowVersionId: string },
  ): Promise<void> {
    const workflowRunRepository =
      this.workspaceOrmManager.getRepositoryWithoutPermissionChecks<WorkflowRunWorkspaceEntity>(
        'workflowRun',
      );

    const findRunBatch = () =>
      workflowRunRepository.find({
        where,
        select: { id: true },
        take: WORKFLOW_RUN_DELETION_BATCH_SIZE,
        withDeleted: true,
      });

    let batchRuns = await findRunBatch();

    while (batchRuns.length > 0) {
      await workflowRunRepository.delete(batchRuns.map(({ id }) => id));

      batchRuns = await findRunBatch();
    }
  }
}
