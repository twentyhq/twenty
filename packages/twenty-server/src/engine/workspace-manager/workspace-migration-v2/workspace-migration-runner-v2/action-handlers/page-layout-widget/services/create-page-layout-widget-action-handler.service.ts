import { Injectable } from '@nestjs/common';

import {
  OptimisticallyApplyActionOnAllFlatEntityMapsArgs,
  WorkspaceMigrationRunnerActionHandler,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { PageLayoutWidgetEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/page-layout-widget.entity';
import { CreatePageLayoutWidgetAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/page-layout-widget/types/workspace-migration-page-layout-widget-action-v2.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

@Injectable()
export class CreatePageLayoutWidgetActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create_page_layout_widget',
) {
  constructor() {
    super();
  }

  optimisticallyApplyActionOnAllFlatEntityMaps({
    action,
    allFlatEntityMaps,
  }: OptimisticallyApplyActionOnAllFlatEntityMapsArgs<CreatePageLayoutWidgetAction>): Partial<AllFlatEntityMaps> {
    const { flatPageLayoutWidgetMaps } = allFlatEntityMaps;
    const { pageLayoutWidget } = action;

    const updatedFlatPageLayoutWidgetMaps =
      addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: pageLayoutWidget,
        flatEntityMaps: flatPageLayoutWidgetMaps,
      });

    return {
      flatPageLayoutWidgetMaps: updatedFlatPageLayoutWidgetMaps,
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<CreatePageLayoutWidgetAction>,
  ): Promise<void> {
    const { action, queryRunner, workspaceId } = context;
    const { pageLayoutWidget } = action;

    const pageLayoutWidgetRepository =
      queryRunner.manager.getRepository<PageLayoutWidgetEntity>(
        PageLayoutWidgetEntity,
      );

    await pageLayoutWidgetRepository.insert({
      ...pageLayoutWidget,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<CreatePageLayoutWidgetAction>,
  ): Promise<void> {
    return;
  }
}
