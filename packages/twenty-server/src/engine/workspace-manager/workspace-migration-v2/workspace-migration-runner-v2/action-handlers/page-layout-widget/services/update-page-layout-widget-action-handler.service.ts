import { Injectable } from '@nestjs/common';

import {
  OptimisticallyApplyActionOnAllFlatEntityMapsArgs,
  WorkspaceMigrationRunnerActionHandler,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { updateFlatEntityInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/update-flat-entity-in-flat-entity-maps-or-throw.util';
import { PageLayoutWidgetEntity } from 'src/engine/metadata-modules/page-layout/entities/page-layout-widget.entity';
import { UpdatePageLayoutWidgetAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/page-layout-widget/types/workspace-migration-page-layout-widget-action-v2.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';
import { fromFlatEntityPropertiesUpdatesToPartialFlatEntity } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/from-flat-entity-properties-updates-to-partial-flat-entity';

@Injectable()
export class UpdatePageLayoutWidgetActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update_page_layout_widget',
) {
  constructor() {
    super();
  }

  optimisticallyApplyActionOnAllFlatEntityMaps({
    action,
    allFlatEntityMaps,
  }: OptimisticallyApplyActionOnAllFlatEntityMapsArgs<UpdatePageLayoutWidgetAction>): Partial<AllFlatEntityMaps> {
    const { flatPageLayoutWidgetMaps } = allFlatEntityMaps;
    const { pageLayoutWidgetId, updates } = action;

    const partialFlatPageLayoutWidget =
      fromFlatEntityPropertiesUpdatesToPartialFlatEntity({
        updates,
      });

    const updatedFlatPageLayoutWidgetMaps =
      updateFlatEntityInFlatEntityMapsOrThrow({
        flatEntityId: pageLayoutWidgetId,
        flatEntityMaps: flatPageLayoutWidgetMaps,
        partialFlatEntity: partialFlatPageLayoutWidget,
      });

    return {
      flatPageLayoutWidgetMaps: updatedFlatPageLayoutWidgetMaps,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<UpdatePageLayoutWidgetAction>,
  ): Promise<void> {
    const { action, queryRunner } = context;
    const { pageLayoutWidgetId, updates } = action;

    const pageLayoutWidgetRepository =
      queryRunner.manager.getRepository<PageLayoutWidgetEntity>(
        PageLayoutWidgetEntity,
      );

    const partialPageLayoutWidget =
      fromFlatEntityPropertiesUpdatesToPartialFlatEntity({
        updates,
      });

    await pageLayoutWidgetRepository.update(
      { id: pageLayoutWidgetId },
      partialPageLayoutWidget,
    );
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<UpdatePageLayoutWidgetAction>,
  ): Promise<void> {
    return;
  }
}
