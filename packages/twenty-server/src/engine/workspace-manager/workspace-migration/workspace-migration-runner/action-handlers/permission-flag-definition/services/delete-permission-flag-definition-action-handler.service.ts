import { Injectable } from '@nestjs/common';

import { PermissionFlagDefinitionEntity } from 'src/engine/metadata-modules/permission-flag-definition/entities/permission-flag-definition.entity';
import {
  type FlatDeletePermissionFlagDefinitionAction,
  type UniversalDeletePermissionFlagDefinitionAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/permission-flag-definition/types/workspace-migration-permission-flag-definition-action.type';
import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';
import {
  type WorkspaceMigrationActionRunnerArgs,
  type WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeletePermissionFlagDefinitionActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete',
  'permissionFlagDefinition',
) {
  constructor() {
    super();
  }

  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalDeletePermissionFlagDefinitionAction>,
  ): Promise<FlatDeletePermissionFlagDefinitionAction> {
    return this.transpileUniversalDeleteActionToFlatDeleteAction(context);
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatDeletePermissionFlagDefinitionAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;

    const repository =
      queryRunner.manager.getRepository<PermissionFlagDefinitionEntity>(
        PermissionFlagDefinitionEntity,
      );

    await repository.delete({
      id: flatAction.entityId,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatDeletePermissionFlagDefinitionAction>,
  ): Promise<void> {
    return;
  }
}
