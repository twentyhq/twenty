import { Injectable } from '@nestjs/common';

import {
  OptimisticallyApplyActionOnAllFlatEntityMapsArgs,
  WorkspaceMigrationRunnerActionHandler,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { replaceFlatEntityInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/replace-flat-entity-in-flat-entity-maps-or-throw.util';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { UpdateViewAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/view/types/workspace-migration-view-action-v2.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';
import { fromFlatEntityPropertiesUpdatesToPartialFlatEntity } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/from-flat-entity-properties-updates-to-partial-flat-entity';

@Injectable()
export class UpdateViewActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update_view',
) {
  constructor() {
    super();
  }

  optimisticallyApplyActionOnAllFlatEntityMaps({
    action,
    allFlatEntityMaps,
  }: OptimisticallyApplyActionOnAllFlatEntityMapsArgs<UpdateViewAction>): Partial<AllFlatEntityMaps> {
    const { flatViewMaps } = allFlatEntityMaps;
    const { viewId } = action;

    const existingView = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: viewId,
      flatEntityMaps: flatViewMaps,
    });

    const updatedView = {
      ...existingView,
      ...fromFlatEntityPropertiesUpdatesToPartialFlatEntity(action),
    };

    const updatedFlatViewMaps = replaceFlatEntityInFlatEntityMapsOrThrow({
      flatEntity: updatedView,
      flatEntityMaps: flatViewMaps,
    });

    return {
      flatViewMaps: updatedFlatViewMaps,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<UpdateViewAction>,
  ): Promise<void> {
    const { action, queryRunner } = context;
    const { viewId } = action;

    const viewRepository =
      queryRunner.manager.getRepository<ViewEntity>(ViewEntity);

    await viewRepository.update(
      viewId,
      fromFlatEntityPropertiesUpdatesToPartialFlatEntity(action),
    );
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<UpdateViewAction>,
  ): Promise<void> {
    return;
  }
}
