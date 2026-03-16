import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';
import { PermissionFlagEntity } from 'src/engine/metadata-modules/permission-flag/permission-flag.entity';
import {
  FlatDeletePermissionFlagAction,
  UniversalDeletePermissionFlagAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/permission-flag/types/workspace-migration-permission-flag-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeletePermissionFlagActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete',
  'permissionFlag',
) {
  constructor() {
    super();
  }

  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalDeletePermissionFlagAction>,
  ): Promise<FlatDeletePermissionFlagAction> {
    return this.transpileUniversalDeleteActionToFlatDeleteAction(context);
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatDeletePermissionFlagAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;

    const permissionFlagRepository =
      queryRunner.manager.getRepository<PermissionFlagEntity>(
        PermissionFlagEntity,
      );

    await permissionFlagRepository.delete({
      id: flatAction.entityId,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatDeletePermissionFlagAction>,
  ): Promise<void> {
    return;
  }
}
