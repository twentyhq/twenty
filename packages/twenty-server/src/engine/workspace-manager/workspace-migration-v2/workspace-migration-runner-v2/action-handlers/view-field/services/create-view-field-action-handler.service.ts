import { Injectable } from '@nestjs/common';

import {
  OptimisticallyApplyActionOnAllFlatEntityMapsArgs,
  WorkspaceMigrationRunnerActionHandler,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { ViewFieldEntity } from 'src/engine/core-modules/view/entities/view-field.entity';
import { CreateViewFieldAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-view-field-action-v2.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

@Injectable()
export class CreateViewFieldActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create_view_field',
) {
  constructor() {
    super();
  }

  optimisticallyApplyActionOnAllFlatEntityMaps({
    action,
    allFlatEntityMaps,
  }: OptimisticallyApplyActionOnAllFlatEntityMapsArgs<CreateViewFieldAction>): Partial<AllFlatEntityMaps> {
    const { flatViewFieldMaps } = allFlatEntityMaps;
    const { viewField } = action;

    const updatedFlatViewFieldMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: viewField,
      flatEntityMaps: flatViewFieldMaps,
    });

    return {
      flatViewFieldMaps: updatedFlatViewFieldMaps,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<CreateViewFieldAction>,
  ): Promise<void> {
    const { action, queryRunner, workspaceId } = context;
    const { viewField } = action;

    const viewFieldRepository =
      queryRunner.manager.getRepository<ViewFieldEntity>(ViewFieldEntity);

    await viewFieldRepository.save({
      ...viewField,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<CreateViewFieldAction>,
  ): Promise<void> {
    return;
  }
}
