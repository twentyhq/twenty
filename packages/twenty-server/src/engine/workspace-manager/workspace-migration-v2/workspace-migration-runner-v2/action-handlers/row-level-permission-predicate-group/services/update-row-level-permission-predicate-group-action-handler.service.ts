import { Injectable } from '@nestjs/common';

import {
  OptimisticallyApplyActionOnAllFlatEntityMapsArgs,
  WorkspaceMigrationRunnerActionHandler,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { replaceFlatEntityInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/replace-flat-entity-in-flat-entity-maps-or-throw.util';
import { RowLevelPermissionPredicateGroupEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate-group.entity';
import { UpdateRowLevelPermissionPredicateGroupAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/row-level-permission-predicate-group/types/workspace-migration-row-level-permission-predicate-group-action-v2.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';
import { fromFlatEntityPropertiesUpdatesToPartialFlatEntity } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/from-flat-entity-properties-updates-to-partial-flat-entity';

@Injectable()
export class UpdateRowLevelPermissionPredicateGroupActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update_row_level_permission_predicate_group',
) {
  optimisticallyApplyActionOnAllFlatEntityMaps({
    action,
    allFlatEntityMaps,
  }: OptimisticallyApplyActionOnAllFlatEntityMapsArgs<UpdateRowLevelPermissionPredicateGroupAction>): Partial<AllFlatEntityMaps> {
    const { flatRowLevelPermissionPredicateGroupMaps } = allFlatEntityMaps;
    const { rowLevelPermissionPredicateGroupId } = action;

    const existingGroup = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: rowLevelPermissionPredicateGroupId,
      flatEntityMaps: flatRowLevelPermissionPredicateGroupMaps,
    });

    const updatedGroup = {
      ...existingGroup,
      ...fromFlatEntityPropertiesUpdatesToPartialFlatEntity(action),
    };

    const updatedFlatMaps = replaceFlatEntityInFlatEntityMapsOrThrow({
      flatEntity: updatedGroup,
      flatEntityMaps: flatRowLevelPermissionPredicateGroupMaps,
    });

    return {
      flatRowLevelPermissionPredicateGroupMaps: updatedFlatMaps,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<UpdateRowLevelPermissionPredicateGroupAction>,
  ): Promise<void> {
    const { action, queryRunner } = context;
    const { rowLevelPermissionPredicateGroupId } = action;

    const repository =
      queryRunner.manager.getRepository<RowLevelPermissionPredicateGroupEntity>(
        RowLevelPermissionPredicateGroupEntity,
      );

    const update = fromFlatEntityPropertiesUpdatesToPartialFlatEntity(action);

    await repository.update(rowLevelPermissionPredicateGroupId, update);
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<UpdateRowLevelPermissionPredicateGroupAction>,
  ): Promise<void> {
    return;
  }
}
