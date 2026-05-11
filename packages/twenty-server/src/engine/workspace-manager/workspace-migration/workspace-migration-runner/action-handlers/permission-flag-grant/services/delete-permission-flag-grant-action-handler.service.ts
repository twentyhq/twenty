import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';
import { PermissionFlagGrantEntity } from 'src/engine/metadata-modules/permission-flag-grant/permission-flag-grant.entity';
import {
  FlatDeletePermissionFlagGrantAction,
  UniversalDeletePermissionFlagGrantAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/permission-flag-grant/types/workspace-migration-permission-flag-grant-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeletePermissionFlagGrantActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete',
  'permissionFlagGrant',
) {
  constructor() {
    super();
  }

  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalDeletePermissionFlagGrantAction>,
  ): Promise<FlatDeletePermissionFlagGrantAction> {
    return this.transpileUniversalDeleteActionToFlatDeleteAction(context);
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatDeletePermissionFlagGrantAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;

    const permissionFlagGrantRepository =
      queryRunner.manager.getRepository<PermissionFlagGrantEntity>(
        PermissionFlagGrantEntity,
      );

    await permissionFlagGrantRepository.delete({
      id: flatAction.entityId,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatDeletePermissionFlagGrantAction>,
  ): Promise<void> {
    return;
  }
}
