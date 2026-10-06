import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import { DeferredWorkspaceMigrationActionHandlerDecorator } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/deferred-action-handlers/decorators/deferred-workspace-migration-action-handler.decorator';
import { type DeferredWorkspaceMigrationActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/deferred-action-handlers/interfaces/deferred-workspace-migration-action-handler.interface';
import { type DeferredWorkspaceMigrationActionExecutionArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-migration-action-execution-args.type';
import { type DeferredWorkspaceMigrationActionPayload } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-migration-action.type';
import { WorkflowDeletionCleanupWorkspaceService } from 'src/modules/workflow/workflow-deletion/services/workflow-deletion-cleanup.workspace-service';

@Injectable()
@DeferredWorkspaceMigrationActionHandlerDecorator('delete_workflowRuns')
export class DeleteWorkflowRunsDeferredActionHandlerWorkspaceService implements DeferredWorkspaceMigrationActionHandler<'delete_workflowRuns'> {
  readonly metadataNamesToLoad = ['workflow' as const];

  constructor(
    private readonly workflowDeletionCleanupWorkspaceService: WorkflowDeletionCleanupWorkspaceService,
  ) {}

  async execute({
    workspaceId,
    payload: { coreWorkflowId, coreWorkflowVersionId },
    queryRunner,
  }: DeferredWorkspaceMigrationActionExecutionArgs<
    DeferredWorkspaceMigrationActionPayload<'delete_workflowRuns'>
  >): Promise<void> {
    if (
      isDefined(coreWorkflowVersionId) &&
      !(await queryRunner.manager.existsBy(WorkflowEntity, {
        id: coreWorkflowId,
        workspaceId,
      }))
    ) {
      return;
    }

    await this.workflowDeletionCleanupWorkspaceService.deleteWorkflowRuns({
      workspaceId,
      coreWorkflowId,
      coreWorkflowVersionId,
    });
  }
}
