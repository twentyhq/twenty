import { Injectable } from '@nestjs/common';

import {
  OptimisticallyApplyActionOnAllFlatEntityMapsArgs,
  WorkspaceMigrationRunnerActionHandler,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { replaceFlatEntityInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/replace-flat-entity-in-flat-entity-maps-or-throw.util';
import { RowLevelPermissionPredicateEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate.entity';
import { UpdateRowLevelPermissionPredicateAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/row-level-permission-predicate/types/workspace-migration-row-level-permission-predicate-action-v2.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';
import { fromFlatEntityPropertiesUpdatesToPartialFlatEntity } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/from-flat-entity-properties-updates-to-partial-flat-entity';

@Injectable()
export class UpdateRowLevelPermissionPredicateActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update_row_level_permission_predicate',
) {
  optimisticallyApplyActionOnAllFlatEntityMaps({
    action,
    allFlatEntityMaps,
  }: OptimisticallyApplyActionOnAllFlatEntityMapsArgs<UpdateRowLevelPermissionPredicateAction>): Partial<AllFlatEntityMaps> {
    const { flatRowLevelPermissionPredicateMaps } = allFlatEntityMaps;
    const { rowLevelPermissionPredicateId } = action;

    const existingPredicate = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: rowLevelPermissionPredicateId,
      flatEntityMaps: flatRowLevelPermissionPredicateMaps,
    });

    const updatedPredicate = {
      ...existingPredicate,
      ...fromFlatEntityPropertiesUpdatesToPartialFlatEntity(action),
    };

    const updatedFlatMaps = replaceFlatEntityInFlatEntityMapsOrThrow({
      flatEntity: updatedPredicate,
      flatEntityMaps: flatRowLevelPermissionPredicateMaps,
    });

    return {
      flatRowLevelPermissionPredicateMaps: updatedFlatMaps,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<UpdateRowLevelPermissionPredicateAction>,
  ): Promise<void> {
    const { action, queryRunner } = context;
    const { rowLevelPermissionPredicateId } = action;

    const repository =
      queryRunner.manager.getRepository<RowLevelPermissionPredicateEntity>(
        RowLevelPermissionPredicateEntity,
      );

    const update = fromFlatEntityPropertiesUpdatesToPartialFlatEntity(action);

    await repository.update(rowLevelPermissionPredicateId, update);
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<UpdateRowLevelPermissionPredicateAction>,
  ): Promise<void> {
    return;
  }
}
