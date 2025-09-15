import { Injectable } from '@nestjs/common';

import { OptimisticallyApplyActionOnAllFlatEntityMapsArgs, WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';

import { deleteFlatEntityFromFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/delete-flat-entity-from-flat-entity-maps-or-throw.util';
import { ViewFieldEntity } from 'src/engine/core-modules/view/entities/view-field.entity';
import { DeleteViewFieldAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-view-field-action-v2.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteViewFieldActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete_view_field',
) {
  constructor() {
    super();
  }

  optimisticallyApplyActionOnAllFlatEntityMaps({
    action,
    allFlatEntityMaps,
  }: OptimisticallyApplyActionOnAllFlatEntityMapsArgs<DeleteViewFieldAction>): AllFlatEntityMaps {
    const { flatViewFieldMaps } = allFlatEntityMaps;
    const { viewFieldId } = action;

    const updatedFlatViewFieldMaps = deleteFlatEntityFromFlatEntityMapsOrThrow({
      entityToDeleteId: viewFieldId,
      flatEntityMaps: flatViewFieldMaps,
    });

    return {
      ...allFlatEntityMaps,
      flatViewFieldMaps: updatedFlatViewFieldMaps,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<DeleteViewFieldAction>,
  ): Promise<void> {
    const { action, queryRunner, workspaceId } = context;
    const { viewFieldId } = action;

    const viewFieldRepository =
      queryRunner.manager.getRepository<ViewFieldEntity>(ViewFieldEntity);

    await viewFieldRepository.delete({
      id: viewFieldId,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<DeleteViewFieldAction>,
  ): Promise<void> {
    return;
  }
}
