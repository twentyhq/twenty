import { Injectable } from '@nestjs/common';

import {
  OptimisticallyApplyActionOnAllFlatEntityMapsArgs,
  WorkspaceMigrationRunnerActionHandler,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { deleteFlatEntityFromFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/delete-flat-entity-from-flat-entity-maps-or-throw.util';
import { PageLayoutWidgetEntity } from 'src/engine/metadata-modules/page-layout/entities/page-layout-widget.entity';
import { DeletePageLayoutWidgetAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/page-layout-widget/types/workspace-migration-page-layout-widget-action-v2.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeletePageLayoutWidgetActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete_page_layout_widget',
) {
  constructor() {
    super();
  }

  optimisticallyApplyActionOnAllFlatEntityMaps({
    action,
    allFlatEntityMaps,
  }: OptimisticallyApplyActionOnAllFlatEntityMapsArgs<DeletePageLayoutWidgetAction>): Partial<AllFlatEntityMaps> {
    const { flatPageLayoutWidgetMaps } = allFlatEntityMaps;
    const { pageLayoutWidgetId } = action;

    const updatedFlatPageLayoutWidgetMaps =
      deleteFlatEntityFromFlatEntityMapsOrThrow({
        flatEntityId: pageLayoutWidgetId,
        flatEntityMaps: flatPageLayoutWidgetMaps,
      });

    return {
      flatPageLayoutWidgetMaps: updatedFlatPageLayoutWidgetMaps,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<DeletePageLayoutWidgetAction>,
  ): Promise<void> {
    const { action, queryRunner } = context;
    const { pageLayoutWidgetId } = action;

    const pageLayoutWidgetRepository =
      queryRunner.manager.getRepository<PageLayoutWidgetEntity>(
        PageLayoutWidgetEntity,
      );

    await pageLayoutWidgetRepository.delete({ id: pageLayoutWidgetId });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<DeletePageLayoutWidgetAction>,
  ): Promise<void> {
    return;
  }
}
