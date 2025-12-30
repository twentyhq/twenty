import { Injectable } from '@nestjs/common';

import {
  OptimisticallyApplyActionOnAllFlatEntityMapsArgs,
  WorkspaceMigrationRunnerActionHandler,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { deleteFlatEntityFromFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/delete-flat-entity-from-flat-entity-maps-or-throw.util';
import { ViewFilterGroupEntity } from 'src/engine/metadata-modules/view-filter-group/entities/view-filter-group.entity';
import { DeleteViewFilterGroupAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/view-filter-group/types/workspace-migration-view-filter-group-action-v2.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteViewFilterGroupActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete_view_filter_group',
) {
  constructor() {
    super();
  }

  optimisticallyApplyActionOnAllFlatEntityMaps({
    action,
    allFlatEntityMaps,
  }: OptimisticallyApplyActionOnAllFlatEntityMapsArgs<DeleteViewFilterGroupAction>): Partial<AllFlatEntityMaps> {
    const { flatViewFilterGroupMaps } = allFlatEntityMaps;
    const { viewFilterGroupId } = action;

    const updatedFlatViewFilterGroupMaps =
      deleteFlatEntityFromFlatEntityMapsOrThrow({
        entityToDeleteId: viewFilterGroupId,
        flatEntityMaps: flatViewFilterGroupMaps,
      });

    return {
      flatViewFilterGroupMaps: updatedFlatViewFilterGroupMaps,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<DeleteViewFilterGroupAction>,
  ): Promise<void> {
    const { action, queryRunner, workspaceId } = context;
    const { viewFilterGroupId } = action;

    const viewFilterGroupRepository =
      queryRunner.manager.getRepository<ViewFilterGroupEntity>(
        ViewFilterGroupEntity,
      );

    await viewFilterGroupRepository.delete({
      id: viewFilterGroupId,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<DeleteViewFilterGroupAction>,
  ): Promise<void> {
    return;
  }
}

