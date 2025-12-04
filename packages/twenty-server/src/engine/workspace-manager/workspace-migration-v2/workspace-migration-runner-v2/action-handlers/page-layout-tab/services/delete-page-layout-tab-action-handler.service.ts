import { Injectable } from '@nestjs/common';

import {
  OptimisticallyApplyActionOnAllFlatEntityMapsArgs,
  WorkspaceMigrationRunnerActionHandler,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { PageLayoutTabEntity } from 'src/engine/core-modules/page-layout/entities/page-layout-tab.entity';
import { AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { deleteFlatEntityFromFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/delete-flat-entity-from-flat-entity-maps-or-throw.util';
import { DeletePageLayoutTabAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/page-layout-tab/types/workspace-migration-page-layout-tab-action-v2.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeletePageLayoutTabActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete_page_layout_tab',
) {
  constructor() {
    super();
  }

  optimisticallyApplyActionOnAllFlatEntityMaps({
    action,
    allFlatEntityMaps,
  }: OptimisticallyApplyActionOnAllFlatEntityMapsArgs<DeletePageLayoutTabAction>): Partial<AllFlatEntityMaps> {
    const { flatPageLayoutTabMaps } = allFlatEntityMaps;
    const { flatEntityId } = action;

    const updatedFlatPageLayoutTabMaps =
      deleteFlatEntityFromFlatEntityMapsOrThrow({
        entityToDeleteId: flatEntityId,
        flatEntityMaps: flatPageLayoutTabMaps,
      });

    return {
      flatPageLayoutTabMaps: updatedFlatPageLayoutTabMaps,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<DeletePageLayoutTabAction>,
  ): Promise<void> {
    const { action, queryRunner, workspaceId } = context;
    const { flatEntityId } = action;

    const pageLayoutTabRepository =
      queryRunner.manager.getRepository<PageLayoutTabEntity>(
        PageLayoutTabEntity,
      );

    await pageLayoutTabRepository.delete({ id: flatEntityId, workspaceId });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<DeletePageLayoutTabAction>,
  ): Promise<void> {
    return;
  }
}

