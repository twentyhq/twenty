import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { PageLayoutWidgetEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/page-layout-widget.entity';
import { DeletePageLayoutWidgetAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/page-layout-widget/types/workspace-migration-page-layout-widget-action-v2.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeletePageLayoutWidgetActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete',
  'pageLayoutWidget',
) {
  constructor() {
    super();
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<DeletePageLayoutWidgetAction>,
  ): Promise<void> {
    const { action, queryRunner } = context;
    const { entityId } = action;

    const pageLayoutWidgetRepository =
      queryRunner.manager.getRepository<PageLayoutWidgetEntity>(
        PageLayoutWidgetEntity,
      );

    await pageLayoutWidgetRepository.delete({ id: entityId });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<DeletePageLayoutWidgetAction>,
  ): Promise<void> {
    return;
  }
}
