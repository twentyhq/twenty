import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import {
  FlatDeleteWorkflowAction,
  UniversalDeleteWorkflowAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/workflow/types/workspace-migration-workflow-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteWorkflowActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete',
  'workflow',
) {
  constructor() {
    super();
  }

  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalDeleteWorkflowAction>,
  ): Promise<FlatDeleteWorkflowAction> {
    return this.transpileUniversalDeleteActionToFlatDeleteAction(context);
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatDeleteWorkflowAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;

    const workflowRepository =
      queryRunner.manager.getRepository<WorkflowEntity>(WorkflowEntity);

    await workflowRepository.delete({
      id: flatAction.entityId,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatDeleteWorkflowAction>,
  ): Promise<void> {
    return;
  }
}
