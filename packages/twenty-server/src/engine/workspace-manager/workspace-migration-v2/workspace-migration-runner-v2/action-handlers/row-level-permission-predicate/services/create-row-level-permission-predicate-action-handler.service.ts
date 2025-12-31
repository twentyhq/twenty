/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import {
  OptimisticallyApplyActionOnAllFlatEntityMapsArgs,
  WorkspaceMigrationRunnerActionHandler,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { RowLevelPermissionPredicateEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate.entity';
import { CreateRowLevelPermissionPredicateAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/row-level-permission-predicate/types/workspace-migration-row-level-permission-predicate-action-v2.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

@Injectable()
export class CreateRowLevelPermissionPredicateActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create_row_level_permission_predicate',
) {
  optimisticallyApplyActionOnAllFlatEntityMaps({
    action,
    allFlatEntityMaps,
  }: OptimisticallyApplyActionOnAllFlatEntityMapsArgs<CreateRowLevelPermissionPredicateAction>): Partial<AllFlatEntityMaps> {
    const { flatRowLevelPermissionPredicateMaps } = allFlatEntityMaps;
    const { rowLevelPermissionPredicate } = action;

    const updatedFlatMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: rowLevelPermissionPredicate,
      flatEntityMaps: flatRowLevelPermissionPredicateMaps,
    });

    return {
      flatRowLevelPermissionPredicateMaps: updatedFlatMaps,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<CreateRowLevelPermissionPredicateAction>,
  ): Promise<void> {
    const { action, queryRunner, workspaceId } = context;
    const { rowLevelPermissionPredicate } = action;

    const repository =
      queryRunner.manager.getRepository<RowLevelPermissionPredicateEntity>(
        RowLevelPermissionPredicateEntity,
      );

    await repository.insert({
      ...rowLevelPermissionPredicate,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<CreateRowLevelPermissionPredicateAction>,
  ): Promise<void> {
    return;
  }
}
