import { Injectable } from '@nestjs/common';

import {
  type OptimisticallyApplyActionOnAllFlatEntityMapsArgs,
  WorkspaceMigrationRunnerActionHandler,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { replaceFlatEntityInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/replace-flat-entity-in-flat-entity-maps-or-throw.util';
import { ViewFilterGroupEntity } from 'src/engine/metadata-modules/view-filter-group/entities/view-filter-group.entity';
import { type UpdateViewFilterGroupAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/view-filter-group/types/workspace-migration-view-filter-group-action-v2.type';
import { type WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';
import { fromFlatEntityPropertiesUpdatesToPartialFlatEntity } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/from-flat-entity-properties-updates-to-partial-flat-entity';

@Injectable()
export class UpdateViewFilterGroupActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update_view_filter_group',
) {
  constructor() {
    super();
  }

  optimisticallyApplyActionOnAllFlatEntityMaps({
    action,
    allFlatEntityMaps,
  }: OptimisticallyApplyActionOnAllFlatEntityMapsArgs<UpdateViewFilterGroupAction>): Partial<AllFlatEntityMaps> {
    const { flatViewFilterGroupMaps } = allFlatEntityMaps;
    const { viewFilterGroupId } = action;

    const existingViewFilterGroup = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: viewFilterGroupId,
      flatEntityMaps: flatViewFilterGroupMaps,
    });

    const updatedViewFilterGroup = {
      ...existingViewFilterGroup,
      ...fromFlatEntityPropertiesUpdatesToPartialFlatEntity(action),
    };

    const updatedFlatViewFilterGroupMaps =
      replaceFlatEntityInFlatEntityMapsOrThrow({
        flatEntity: updatedViewFilterGroup,
        flatEntityMaps: flatViewFilterGroupMaps,
      });

    return {
      flatViewFilterGroupMaps: updatedFlatViewFilterGroupMaps,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<UpdateViewFilterGroupAction>,
  ): Promise<void> {
    const { action, queryRunner } = context;
    const { viewFilterGroupId } = action;

    const viewFilterGroupRepository =
      queryRunner.manager.getRepository<ViewFilterGroupEntity>(
        ViewFilterGroupEntity,
      );

    const update = fromFlatEntityPropertiesUpdatesToPartialFlatEntity(action);

    await viewFilterGroupRepository.update(viewFilterGroupId, update);
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<UpdateViewFilterGroupAction>,
  ): Promise<void> {
    return;
  }
}

