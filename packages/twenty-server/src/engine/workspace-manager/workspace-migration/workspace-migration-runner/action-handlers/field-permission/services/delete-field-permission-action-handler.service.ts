import { Injectable } from '@nestjs/common';

import { FieldPermissionEntity } from 'src/engine/metadata-modules/object-permission/field-permission/field-permission.entity';
import {
  FlatDeleteFieldPermissionAction,
  UniversalDeleteFieldPermissionAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/field-permission/types/workspace-migration-field-permission-action.type';
import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteFieldPermissionActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete',
  'fieldPermission',
) {
  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalDeleteFieldPermissionAction>,
  ): Promise<FlatDeleteFieldPermissionAction> {
    return this.transpileUniversalDeleteActionToFlatDeleteAction(context);
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatDeleteFieldPermissionAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;

    const fieldPermissionRepository =
      queryRunner.manager.getRepository<FieldPermissionEntity>(
        FieldPermissionEntity,
      );

    await fieldPermissionRepository.delete({
      id: flatAction.entityId,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatDeleteFieldPermissionAction>,
  ): Promise<void> {
    return;
  }
}
