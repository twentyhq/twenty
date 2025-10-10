import { Injectable } from '@nestjs/common';

import {
  OptimisticallyApplyActionOnAllFlatEntityMapsArgs,
  WorkspaceMigrationRunnerActionHandler,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { replaceFlatEntityInFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/replace-flat-entity-in-flat-entity-maps-or-throw.util';
import { ViewFilterEntity } from 'src/engine/metadata-modules/view-filter/entities/view-filter.entity';
import { UpdateViewFilterAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-view-filter-action-v2.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';
import { fromWorkspaceMigrationUpdateActionToPartialEntity } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/from-workspace-migration-update-action-to-partial-field-or-object-entity.util';

@Injectable()
export class UpdateViewFilterActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update_view_filter',
) {
  constructor() {
    super();
  }

  optimisticallyApplyActionOnAllFlatEntityMaps({
    action,
    allFlatEntityMaps,
  }: OptimisticallyApplyActionOnAllFlatEntityMapsArgs<UpdateViewFilterAction>): Partial<AllFlatEntityMaps> {
    const { flatViewFilterMaps } = allFlatEntityMaps;
    const { viewFilterId } = action;

    const existingViewFilter = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: viewFilterId,
      flatEntityMaps: flatViewFilterMaps,
    });

    const updatedViewFilter = {
      ...existingViewFilter,
      ...fromWorkspaceMigrationUpdateActionToPartialEntity(action),
    };

    const updatedFlatViewFilterMaps = replaceFlatEntityInFlatEntityMapsOrThrow({
      flatEntity: updatedViewFilter,
      flatEntityMaps: flatViewFilterMaps,
    });

    return {
      flatViewFilterMaps: updatedFlatViewFilterMaps,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<UpdateViewFilterAction>,
  ): Promise<void> {
    const { action, queryRunner } = context;
    const { viewFilterId } = action;

    const viewFilterRepository =
      queryRunner.manager.getRepository<ViewFilterEntity>(ViewFilterEntity);

    const update = fromWorkspaceMigrationUpdateActionToPartialEntity(action);

    await viewFilterRepository.update(viewFilterId, update);
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<UpdateViewFilterAction>,
  ): Promise<void> {
    return;
  }
}
