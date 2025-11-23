import { Injectable } from '@nestjs/common';

import {
  OptimisticallyApplyActionOnAllFlatEntityMapsArgs,
  WorkspaceMigrationRunnerActionHandler,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';
import { CreateRoleTargetAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/role-target/types/workspace-migration-role-target-action-v2.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

@Injectable()
export class CreateRoleTargetActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create_role_target',
) {
  optimisticallyApplyActionOnAllFlatEntityMaps({
    action,
    allFlatEntityMaps,
  }: OptimisticallyApplyActionOnAllFlatEntityMapsArgs<CreateRoleTargetAction>): Partial<AllFlatEntityMaps> {
    const { flatRoleTargetMaps } = allFlatEntityMaps;
    const { roleTarget } = action;

    const updatedFlatRoleTargetMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: roleTarget,
      flatEntityMaps: flatRoleTargetMaps,
    });

    return {
      flatRoleTargetMaps: updatedFlatRoleTargetMaps,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<CreateRoleTargetAction>,
  ): Promise<void> {
    const { action, queryRunner, workspaceId } = context;
    const { roleTarget } = action;

    const roleTargetRepository =
      queryRunner.manager.getRepository<RoleTargetsEntity>(RoleTargetsEntity);

    await roleTargetRepository.insert({
      ...roleTarget,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<CreateRoleTargetAction>,
  ): Promise<void> {
    return;
  }
}
