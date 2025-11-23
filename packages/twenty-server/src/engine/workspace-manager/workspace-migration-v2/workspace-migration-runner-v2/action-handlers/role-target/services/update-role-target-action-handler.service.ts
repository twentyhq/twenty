import { Injectable } from '@nestjs/common';

import {
  OptimisticallyApplyActionOnAllFlatEntityMapsArgs,
  WorkspaceMigrationRunnerActionHandler,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { replaceFlatEntityInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/replace-flat-entity-in-flat-entity-maps-or-throw.util';
import { RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';
import { UpdateRoleTargetAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/role-target/types/workspace-migration-role-target-action-v2.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';
import { fromFlatEntityPropertiesUpdatesToPartialFlatEntity } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/from-flat-entity-properties-updates-to-partial-flat-entity';

@Injectable()
export class UpdateRoleTargetActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update_role_target',
) {
  constructor() {
    super();
  }

  optimisticallyApplyActionOnAllFlatEntityMaps({
    action,
    allFlatEntityMaps,
  }: OptimisticallyApplyActionOnAllFlatEntityMapsArgs<UpdateRoleTargetAction>): Partial<AllFlatEntityMaps> {
    const { flatRoleTargetMaps } = allFlatEntityMaps;
    const { roleTargetId } = action;

    const existingRoleTarget = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: roleTargetId,
      flatEntityMaps: flatRoleTargetMaps,
    });

    const updatedRoleTarget = {
      ...existingRoleTarget,
      ...fromFlatEntityPropertiesUpdatesToPartialFlatEntity(action),
    };

    const updatedFlatRoleTargetMaps = replaceFlatEntityInFlatEntityMapsOrThrow({
      flatEntity: updatedRoleTarget,
      flatEntityMaps: flatRoleTargetMaps,
    });

    return {
      flatRoleTargetMaps: updatedFlatRoleTargetMaps,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<UpdateRoleTargetAction>,
  ): Promise<void> {
    const { action, queryRunner } = context;
    const { roleTargetId } = action;

    const roleTargetRepository =
      queryRunner.manager.getRepository<RoleTargetsEntity>(RoleTargetsEntity);

    const update = fromFlatEntityPropertiesUpdatesToPartialFlatEntity(action);

    await roleTargetRepository.update(roleTargetId, update);
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<UpdateRoleTargetAction>,
  ): Promise<void> {
    return;
  }
}
