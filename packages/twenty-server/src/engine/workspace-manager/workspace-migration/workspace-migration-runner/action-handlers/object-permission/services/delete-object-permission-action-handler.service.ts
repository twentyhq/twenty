import { Injectable } from '@nestjs/common';

import { ObjectPermissionEntity } from 'src/engine/metadata-modules/object-permission/object-permission.entity';
import {
  FlatDeleteObjectPermissionAction,
  UniversalDeleteObjectPermissionAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/object-permission/types/workspace-migration-object-permission-action.type';
import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteObjectPermissionActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete',
  'objectPermission',
) {
  constructor() {
    super();
  }

  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalDeleteObjectPermissionAction>,
  ): Promise<FlatDeleteObjectPermissionAction> {
    return this.transpileUniversalDeleteActionToFlatDeleteAction(context);
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatDeleteObjectPermissionAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;

    const objectPermissionRepository =
      queryRunner.manager.getRepository<ObjectPermissionEntity>(
        ObjectPermissionEntity,
      );

    await objectPermissionRepository.delete({
      id: flatAction.entityId,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatDeleteObjectPermissionAction>,
  ): Promise<void> {
    return;
  }
}
