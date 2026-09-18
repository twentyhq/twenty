import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import {
  FlatDeleteWorkflowVersionAction,
  UniversalDeleteWorkflowVersionAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/workflow-version/types/workspace-migration-workflow-version-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteWorkflowVersionActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete',
  'workflowVersion',
) {
  constructor() {
    super();
  }

  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalDeleteWorkflowVersionAction>,
  ): Promise<FlatDeleteWorkflowVersionAction> {
    return this.transpileUniversalDeleteActionToFlatDeleteAction(context);
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatDeleteWorkflowVersionAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;

    const connectionProviderRepository =
      queryRunner.manager.getRepository<ConnectionProviderEntity>(
        ConnectionProviderEntity,
      );

    await connectionProviderRepository.delete({
      id: flatAction.entityId,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatDeleteWorkflowVersionAction>,
  ): Promise<void> {
    return;
  }
}
