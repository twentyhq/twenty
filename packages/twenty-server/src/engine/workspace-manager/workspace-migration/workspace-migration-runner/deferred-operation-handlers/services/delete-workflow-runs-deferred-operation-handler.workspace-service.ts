import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { DeferredWorkspaceOperationHandlerDecorator } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/deferred-operation-handlers/decorators/deferred-workspace-operation-handler.decorator';
import { type DeferredWorkspaceOperationHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/deferred-operation-handlers/interfaces/deferred-workspace-operation-handler.interface';
import { type DeferredWorkspaceOperationExecutionArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-operation-execution-args.type';
import { type DeferredWorkspaceOperationPayload } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-operation.type';
import { WorkflowDeletionCleanupWorkspaceService } from 'src/modules/workflow/workflow-deletion/services/workflow-deletion-cleanup.workspace-service';

@Injectable()
@DeferredWorkspaceOperationHandlerDecorator('delete_workflowRuns')
export class DeleteWorkflowRunsDeferredOperationHandlerWorkspaceService implements DeferredWorkspaceOperationHandler<'delete_workflowRuns'> {
  readonly metadataNamesToLoad = ['workflow' as const];

  constructor(
    private readonly workflowDeletionCleanupWorkspaceService: WorkflowDeletionCleanupWorkspaceService,
  ) {}

  async execute({
    workspaceId,
    payload: { coreWorkflowId, coreWorkflowVersionId },
    queryRunner,
  }: DeferredWorkspaceOperationExecutionArgs<
    DeferredWorkspaceOperationPayload<'delete_workflowRuns'>
  >): Promise<void> {
    if (isDefined(coreWorkflowVersionId)) {
      const [existingWorkflow] = await queryRunner.query(
        `SELECT id FROM core."workflow" WHERE id = $1 AND "workspaceId" = $2`,
        [coreWorkflowId, workspaceId],
      );

      if (!isDefined(existingWorkflow)) {
        return;
      }
    }

    await this.workflowDeletionCleanupWorkspaceService.deleteWorkflowRuns({
      workspaceId,
      coreWorkflowId,
      coreWorkflowVersionId,
    });
  }
}
