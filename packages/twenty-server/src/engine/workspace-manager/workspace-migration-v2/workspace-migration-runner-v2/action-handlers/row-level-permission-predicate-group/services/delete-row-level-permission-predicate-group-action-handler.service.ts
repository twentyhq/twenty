/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import {
  OptimisticallyApplyActionOnAllFlatEntityMapsArgs,
  WorkspaceMigrationRunnerActionHandler,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { deleteFlatEntityFromFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/delete-flat-entity-from-flat-entity-maps-or-throw.util';
import { RowLevelPermissionPredicateGroupEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate-group.entity';
import { DeleteRowLevelPermissionPredicateGroupAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/row-level-permission-predicate-group/types/workspace-migration-row-level-permission-predicate-group-action-v2.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteRowLevelPermissionPredicateGroupActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete_row_level_permission_predicate_group',
) {
  optimisticallyApplyActionOnAllFlatEntityMaps({
    action,
    allFlatEntityMaps,
  }: OptimisticallyApplyActionOnAllFlatEntityMapsArgs<DeleteRowLevelPermissionPredicateGroupAction>): Partial<AllFlatEntityMaps> {
    const { flatRowLevelPermissionPredicateGroupMaps } = allFlatEntityMaps;
    const { rowLevelPermissionPredicateGroupId } = action;

    const updatedFlatMaps = deleteFlatEntityFromFlatEntityMapsOrThrow({
      entityToDeleteId: rowLevelPermissionPredicateGroupId,
      flatEntityMaps: flatRowLevelPermissionPredicateGroupMaps,
    });

    return {
      flatRowLevelPermissionPredicateGroupMaps: updatedFlatMaps,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<DeleteRowLevelPermissionPredicateGroupAction>,
  ): Promise<void> {
    const { action, queryRunner, workspaceId } = context;
    const { rowLevelPermissionPredicateGroupId } = action;

    const repository =
      queryRunner.manager.getRepository<RowLevelPermissionPredicateGroupEntity>(
        RowLevelPermissionPredicateGroupEntity,
      );

    await repository.delete({
      id: rowLevelPermissionPredicateGroupId,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<DeleteRowLevelPermissionPredicateGroupAction>,
  ): Promise<void> {
    return;
  }
}
