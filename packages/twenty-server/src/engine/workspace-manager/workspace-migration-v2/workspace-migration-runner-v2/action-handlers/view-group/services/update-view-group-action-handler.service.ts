import { Injectable } from '@nestjs/common';

import {
  OptimisticallyApplyActionOnAllFlatEntityMapsArgs,
  WorkspaceMigrationRunnerActionHandler,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { replaceFlatEntityInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/replace-flat-entity-in-flat-entity-maps-or-throw.util';
import { ViewGroupEntity } from 'src/engine/metadata-modules/view-group/entities/view-group.entity';
import { UpdateViewGroupAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/view-group/types/workspace-migration-view-group-action-v2.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';
import { fromFlatEntityPropertiesUpdatesToPartialFlatEntity } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/from-flat-entity-properties-updates-to-partial-flat-entity';

@Injectable()
export class UpdateViewGroupActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update_view_group',
) {
  optimisticallyApplyActionOnAllFlatEntityMaps({
    action,
    allFlatEntityMaps,
  }: OptimisticallyApplyActionOnAllFlatEntityMapsArgs<UpdateViewGroupAction>): Partial<AllFlatEntityMaps> {
    const { flatViewGroupMaps } = allFlatEntityMaps;
    const { viewGroupId } = action;

    const existingViewGroup = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: viewGroupId,
      flatEntityMaps: flatViewGroupMaps,
    });

    const updatedViewGroup = {
      ...existingViewGroup,
      ...fromFlatEntityPropertiesUpdatesToPartialFlatEntity(action),
    };

    const updatedFlatViewGroupMaps = replaceFlatEntityInFlatEntityMapsOrThrow({
      flatEntity: updatedViewGroup,
      flatEntityMaps: flatViewGroupMaps,
    });

    return {
      flatViewGroupMaps: updatedFlatViewGroupMaps,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<UpdateViewGroupAction>,
  ): Promise<void> {
    const { action, queryRunner } = context;
    const { viewGroupId } = action;

    const viewGroupRepository =
      queryRunner.manager.getRepository<ViewGroupEntity>(ViewGroupEntity);

    const update = fromFlatEntityPropertiesUpdatesToPartialFlatEntity(action);

    await viewGroupRepository.update(viewGroupId, update);
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<UpdateViewGroupAction>,
  ): Promise<void> {
    return;
  }
}
