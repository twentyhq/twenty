import { Injectable } from '@nestjs/common';

import {
  OptimisticallyApplyActionOnAllFlatEntityMapsArgs,
  WorkspaceMigrationRunnerActionHandler,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';
import { deleteFlatEntityFromFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/delete-flat-entity-from-flat-entity-maps-or-throw.util';
import { ViewFilterEntity } from 'src/engine/metadata-modules/view-filter/entities/view-filter.entity';
import { DeleteViewFilterAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-view-filter-action-v2.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteViewFilterActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete_view_filter',
) {
  constructor() {
    super();
  }

  optimisticallyApplyActionOnAllFlatEntityMaps({
    action,
    allFlatEntityMaps,
  }: OptimisticallyApplyActionOnAllFlatEntityMapsArgs<DeleteViewFilterAction>): Partial<AllFlatEntityMaps> {
    const { flatViewFilterMaps } = allFlatEntityMaps;
    const { viewFilterId } = action;

    const updatedFlatViewFilterMaps = deleteFlatEntityFromFlatEntityMapsOrThrow(
      {
        entityToDeleteId: viewFilterId,
        flatEntityMaps: flatViewFilterMaps,
      },
    );

    return {
      flatViewFilterMaps: updatedFlatViewFilterMaps,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<DeleteViewFilterAction>,
  ): Promise<void> {
    const { action, queryRunner, workspaceId } = context;
    const { viewFilterId } = action;

    const viewFilterRepository =
      queryRunner.manager.getRepository<ViewFilterEntity>(ViewFilterEntity);

    await viewFilterRepository.delete({
      id: viewFilterId,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<DeleteViewFilterAction>,
  ): Promise<void> {
    return;
  }
}
