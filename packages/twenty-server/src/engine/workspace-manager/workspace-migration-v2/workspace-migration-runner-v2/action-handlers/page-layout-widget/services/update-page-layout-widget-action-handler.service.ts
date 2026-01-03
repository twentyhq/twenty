import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { PageLayoutWidgetEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/page-layout-widget.entity';
import { UpdatePageLayoutWidgetAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/page-layout-widget/types/workspace-migration-page-layout-widget-action-v2.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';
import { fromFlatEntityPropertiesUpdatesToPartialFlatEntity } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/from-flat-entity-properties-updates-to-partial-flat-entity';

@Injectable()
export class UpdatePageLayoutWidgetActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update',
  'pageLayoutWidget',
) {
  constructor() {
    super();
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<UpdatePageLayoutWidgetAction>,
  ): Promise<void> {
    const { action, queryRunner } = context;
    const { entityId, updates } = action;

    const pageLayoutWidgetRepository =
      queryRunner.manager.getRepository<PageLayoutWidgetEntity>(
        PageLayoutWidgetEntity,
      );

    const partialPageLayoutWidget =
      fromFlatEntityPropertiesUpdatesToPartialFlatEntity({
        updates,
      });

    await pageLayoutWidgetRepository.update(
      { id: entityId },
      partialPageLayoutWidget,
    );
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<UpdatePageLayoutWidgetAction>,
  ): Promise<void> {
    return;
  }
}
