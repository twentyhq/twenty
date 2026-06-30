import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';
import { RolePermissionFlagEntity } from 'src/engine/metadata-modules/role-permission-flag/role-permission-flag.entity';
import {
  FlatDeleteRolePermissionFlagAction,
  UniversalDeleteRolePermissionFlagAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/role-permission-flag/types/workspace-migration-role-permission-flag-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteRolePermissionFlagActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete',
  'rolePermissionFlag',
) {
  constructor() {
    super();
  }

  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalDeleteRolePermissionFlagAction>,
  ): Promise<FlatDeleteRolePermissionFlagAction> {
    return this.transpileUniversalDeleteActionToFlatDeleteAction(context);
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatDeleteRolePermissionFlagAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;

    const rolePermissionFlagRepository =
      queryRunner.manager.getRepository<RolePermissionFlagEntity>(
        RolePermissionFlagEntity,
      );

    await rolePermissionFlagRepository.delete({
      id: flatAction.entityId,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatDeleteRolePermissionFlagAction>,
  ): Promise<void> {
    return;
  }
}
