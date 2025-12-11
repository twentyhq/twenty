import { Injectable } from '@nestjs/common';

import {
  OptimisticallyApplyActionOnAllFlatEntityMapsArgs,
  WorkspaceMigrationRunnerActionHandler,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { deleteFlatEntityFromFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/delete-flat-entity-from-flat-entity-maps-or-throw.util';
import { RowLevelPermissionPredicateEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate.entity';
import { DeleteRowLevelPermissionPredicateAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/row-level-permission-predicate/types/workspace-migration-row-level-permission-predicate-action-v2.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteRowLevelPermissionPredicateActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete_row_level_permission_predicate',
) {
  optimisticallyApplyActionOnAllFlatEntityMaps({
    action,
    allFlatEntityMaps,
  }: OptimisticallyApplyActionOnAllFlatEntityMapsArgs<DeleteRowLevelPermissionPredicateAction>): Partial<AllFlatEntityMaps> {
    const { flatRowLevelPermissionPredicateMaps } = allFlatEntityMaps;
    const { rowLevelPermissionPredicateId } = action;

    const updatedFlatMaps = deleteFlatEntityFromFlatEntityMapsOrThrow({
      entityToDeleteId: rowLevelPermissionPredicateId,
      flatEntityMaps: flatRowLevelPermissionPredicateMaps,
    });

    return {
      flatRowLevelPermissionPredicateMaps: updatedFlatMaps,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<DeleteRowLevelPermissionPredicateAction>,
  ): Promise<void> {
    const { action, queryRunner, workspaceId } = context;
    const { rowLevelPermissionPredicateId } = action;

    const repository =
      queryRunner.manager.getRepository<RowLevelPermissionPredicateEntity>(
        RowLevelPermissionPredicateEntity,
      );

    await repository.delete({
      id: rowLevelPermissionPredicateId,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<DeleteRowLevelPermissionPredicateAction>,
  ): Promise<void> {
    return;
  }
}
