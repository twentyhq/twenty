import { Injectable } from '@nestjs/common';

import {
  OptimisticallyApplyActionOnAllFlatEntityMapsArgs,
  WorkspaceMigrationRunnerActionHandler,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { PageLayoutTabEntity } from 'src/engine/core-modules/page-layout/entities/page-layout-tab.entity';
import { AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { replaceFlatEntityInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/replace-flat-entity-in-flat-entity-maps-or-throw.util';
import { UpdatePageLayoutTabAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/page-layout-tab/types/workspace-migration-page-layout-tab-action-v2.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';
import { fromFlatEntityPropertiesUpdatesToPartialFlatEntity } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/from-flat-entity-properties-updates-to-partial-flat-entity';

@Injectable()
export class UpdatePageLayoutTabActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update_page_layout_tab',
) {
  optimisticallyApplyActionOnAllFlatEntityMaps({
    action,
    allFlatEntityMaps,
  }: OptimisticallyApplyActionOnAllFlatEntityMapsArgs<UpdatePageLayoutTabAction>): Partial<AllFlatEntityMaps> {
    const { flatPageLayoutTabMaps } = allFlatEntityMaps;
    const { flatEntityId, flatEntityUpdates } = action;

    const existingPageLayoutTab = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId,
      flatEntityMaps: flatPageLayoutTabMaps,
    });

    const updatedPageLayoutTab = {
      ...existingPageLayoutTab,
      ...fromFlatEntityPropertiesUpdatesToPartialFlatEntity({
        updates: flatEntityUpdates,
      }),
    };

    const updatedFlatPageLayoutTabMaps =
      replaceFlatEntityInFlatEntityMapsOrThrow({
        flatEntity: updatedPageLayoutTab,
        flatEntityMaps: flatPageLayoutTabMaps,
      });

    return {
      flatPageLayoutTabMaps: updatedFlatPageLayoutTabMaps,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<UpdatePageLayoutTabAction>,
  ): Promise<void> {
    const { action, queryRunner, workspaceId } = context;
    const { flatEntityId, flatEntityUpdates } = action;

    const pageLayoutTabRepository =
      queryRunner.manager.getRepository<PageLayoutTabEntity>(
        PageLayoutTabEntity,
      );

    await pageLayoutTabRepository.update(
      { id: flatEntityId, workspaceId },
      fromFlatEntityPropertiesUpdatesToPartialFlatEntity({
        updates: flatEntityUpdates,
      }),
    );
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<UpdatePageLayoutTabAction>,
  ): Promise<void> {
    return;
  }
}

