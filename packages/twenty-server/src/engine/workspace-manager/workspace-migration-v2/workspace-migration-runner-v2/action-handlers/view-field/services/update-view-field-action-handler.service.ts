import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { OptimisticallyApplyActionOnAllFlatEntityMapsArgs, WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';
import { WorkspaceMigrationRunnerException, WorkspaceMigrationRunnerExceptionCode } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/exceptions/workspace-migration-runner.exception';

import { replaceFlatEntityInFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/replace-flat-entity-in-flat-entity-maps-or-throw.util';
import { ViewFieldEntity } from 'src/engine/core-modules/view/entities/view-field.entity';
import { UpdateViewFieldAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-view-field-action-v2.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';
import { fromWorkspaceMigrationUpdateActionToPartialEntity } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/from-workspace-migration-update-action-to-partial-field-or-object-entity.util';

@Injectable()
export class UpdateViewFieldActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update_view_field',
) {
  constructor() {
    super();
  }

  optimisticallyApplyActionOnAllFlatEntityMaps({
    action,
    allFlatEntityMaps,
  }: OptimisticallyApplyActionOnAllFlatEntityMapsArgs<UpdateViewFieldAction>): AllFlatEntityMaps {
    const { flatViewFieldMaps } = allFlatEntityMaps;
    const { viewFieldId } = action;

    const existingViewField = flatViewFieldMaps.byId[viewFieldId];

    if (!isDefined(existingViewField)) {
      throw new WorkspaceMigrationRunnerException(
        `Workspace migration failed: View field not found in cache`,
        WorkspaceMigrationRunnerExceptionCode.FLAT_ENTITY_NOT_FOUND,
      );
    }

    const updatedViewField = {
      ...existingViewField,
      ...fromWorkspaceMigrationUpdateActionToPartialEntity(action),
    };

    const updatedFlatViewFieldMaps = replaceFlatEntityInFlatEntityMapsOrThrow({
      flatEntity: updatedViewField,
      flatEntityMaps: flatViewFieldMaps,
    });

    return {
      ...allFlatEntityMaps,
      flatViewFieldMaps: updatedFlatViewFieldMaps,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<UpdateViewFieldAction>,
  ): Promise<void> {
    const { action, queryRunner } = context;
    const { viewFieldId } = action;

    const viewFieldRepository =
      queryRunner.manager.getRepository<ViewFieldEntity>(ViewFieldEntity);

    const update = fromWorkspaceMigrationUpdateActionToPartialEntity(action);

    await viewFieldRepository.update(viewFieldId, update);
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<UpdateViewFieldAction>,
  ): Promise<void> {
    return;
  }
}
