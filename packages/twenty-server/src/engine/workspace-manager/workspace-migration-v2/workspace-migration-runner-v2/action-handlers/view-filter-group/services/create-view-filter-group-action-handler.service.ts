import { Injectable } from '@nestjs/common';

import {
  OptimisticallyApplyActionOnAllFlatEntityMapsArgs,
  WorkspaceMigrationRunnerActionHandler,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { ViewFilterGroupEntity } from 'src/engine/metadata-modules/view-filter-group/entities/view-filter-group.entity';
import { CreateViewFilterGroupAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/view-filter-group/types/workspace-migration-view-filter-group-action-v2.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

@Injectable()
export class CreateViewFilterGroupActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create_view_filter_group',
) {
  optimisticallyApplyActionOnAllFlatEntityMaps({
    action,
    allFlatEntityMaps,
  }: OptimisticallyApplyActionOnAllFlatEntityMapsArgs<CreateViewFilterGroupAction>): Partial<AllFlatEntityMaps> {
    const { flatViewFilterGroupMaps } = allFlatEntityMaps;
    const { viewFilterGroup } = action;

    const updatedFlatViewFilterGroupMaps = addFlatEntityToFlatEntityMapsOrThrow(
      {
        flatEntity: viewFilterGroup,
        flatEntityMaps: flatViewFilterGroupMaps,
      },
    );

    return {
      flatViewFilterGroupMaps: updatedFlatViewFilterGroupMaps,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<CreateViewFilterGroupAction>,
  ): Promise<void> {
    const { action, queryRunner, workspaceId } = context;
    const { viewFilterGroup } = action;

    const viewFilterGroupRepository =
      queryRunner.manager.getRepository<ViewFilterGroupEntity>(
        ViewFilterGroupEntity,
      );

    await viewFilterGroupRepository.insert({
      ...viewFilterGroup,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<CreateViewFilterGroupAction>,
  ): Promise<void> {
    return;
  }
}

