import { Injectable } from '@nestjs/common';

import {
  OptimisticallyApplyActionOnAllFlatEntityMapsArgs,
  WorkspaceMigrationRunnerActionHandler,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { deleteFlatEntityFromFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/delete-flat-entity-from-flat-entity-maps-or-throw.util';
import { RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';
import { DeleteRoleTargetAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/role-target/types/workspace-migration-role-target-action-v2.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteRoleTargetActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete_role_target',
) {
  constructor() {
    super();
  }

  optimisticallyApplyActionOnAllFlatEntityMaps({
    action,
    allFlatEntityMaps,
  }: OptimisticallyApplyActionOnAllFlatEntityMapsArgs<DeleteRoleTargetAction>): Partial<AllFlatEntityMaps> {
    const { flatRoleTargetMaps } = allFlatEntityMaps;
    const { roleTargetId } = action;

    const updatedFlatRoleTargetMaps = deleteFlatEntityFromFlatEntityMapsOrThrow(
      {
        entityToDeleteId: roleTargetId,
        flatEntityMaps: flatRoleTargetMaps,
      },
    );

    return {
      flatRoleTargetMaps: updatedFlatRoleTargetMaps,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<DeleteRoleTargetAction>,
  ): Promise<void> {
    const { action, queryRunner, workspaceId } = context;
    const { roleTargetId } = action;

    const roleTargetRepository =
      queryRunner.manager.getRepository<RoleTargetsEntity>(RoleTargetsEntity);

    await roleTargetRepository.delete({
      id: roleTargetId,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<DeleteRoleTargetAction>,
  ): Promise<void> {
    return;
  }
}

