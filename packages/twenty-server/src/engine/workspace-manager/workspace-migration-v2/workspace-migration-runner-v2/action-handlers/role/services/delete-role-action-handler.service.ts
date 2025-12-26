import { Injectable } from '@nestjs/common';

import {
  OptimisticallyApplyActionOnAllFlatEntityMapsArgs,
  WorkspaceMigrationRunnerActionHandler,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { deleteFlatEntityFromFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/delete-flat-entity-from-flat-entity-maps-or-throw.util';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { DeleteRoleAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/role/types/workspace-migration-role-action-v2.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteRoleActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete_role',
) {
  constructor() {
    super();
  }

  optimisticallyApplyActionOnAllFlatEntityMaps({
    action,
    allFlatEntityMaps,
  }: OptimisticallyApplyActionOnAllFlatEntityMapsArgs<DeleteRoleAction>): Partial<AllFlatEntityMaps> {
    const { flatRoleMaps } = allFlatEntityMaps;
    const { roleId } = action;

    const updatedFlatRoleMaps = deleteFlatEntityFromFlatEntityMapsOrThrow({
      entityToDeleteId: roleId,
      flatEntityMaps: flatRoleMaps,
    });

    return {
      flatRoleMaps: updatedFlatRoleMaps,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<DeleteRoleAction>,
  ): Promise<void> {
    const { action, queryRunner, workspaceId } = context;
    const { roleId } = action;

    const roleRepository =
      queryRunner.manager.getRepository<RoleEntity>(RoleEntity);

    await roleRepository.delete({ id: roleId, workspaceId });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<DeleteRoleAction>,
  ): Promise<void> {
    return;
  }
}
