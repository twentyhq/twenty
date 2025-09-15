import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { OptimisticallyApplyActionOnAllFlatEntityMapsArgs, WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';
import { replaceFlatEntityInFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/replace-flat-entity-in-flat-entity-maps-or-throw.util';
import { WorkspaceMigrationRunnerException, WorkspaceMigrationRunnerExceptionCode } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/exceptions/workspace-migration-runner.exception';

import { ViewEntity } from 'src/engine/core-modules/view/entities/view.entity';
import { UpdateViewAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-view-action-v2.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';
import { fromWorkspaceMigrationUpdateActionToPartialEntity } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/from-workspace-migration-update-action-to-partial-field-or-object-entity.util';

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
  }: OptimisticallyApplyActionOnAllFlatEntityMapsArgs<UpdateViewAction>): AllFlatEntityMaps {
    const { flatViewMaps } = allFlatEntityMaps;
    const { viewId } = action;

    const existingView = flatViewMaps.byId[viewId];

    if (!isDefined(existingView)) {
      throw new WorkspaceMigrationRunnerException(
        `Workspace migration failed: View not found in cache`,
        WorkspaceMigrationRunnerExceptionCode.FLAT_ENTITY_NOT_FOUND,
      );
    }

    const updatedView = {
      ...existingView,
      ...fromWorkspaceMigrationUpdateActionToPartialEntity(action),
    };

    const updatedFlatViewMaps = replaceFlatEntityInFlatEntityMapsOrThrow({
      flatEntity: updatedView,
      flatEntityMaps: flatViewMaps,
    });

    return {
      ...allFlatEntityMaps,
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
      fromWorkspaceMigrationUpdateActionToPartialEntity(action),
    );
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<UpdateViewAction>,
  ): Promise<void> {
    return;
  }
}
