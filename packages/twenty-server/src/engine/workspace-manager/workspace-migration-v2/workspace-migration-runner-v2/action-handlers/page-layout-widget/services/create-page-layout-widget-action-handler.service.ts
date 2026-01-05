import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { PageLayoutWidgetEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/page-layout-widget.entity';
import { CreatePageLayoutWidgetAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/page-layout-widget/types/workspace-migration-page-layout-widget-action-v2.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';

@Injectable()
export class CreatePageLayoutWidgetActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create',
  'pageLayoutWidget',
) {
  constructor() {
    super();
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<CreatePageLayoutWidgetAction>,
  ): Promise<void> {
    const { action, queryRunner, workspaceId } = context;
    const { flatEntity } = action;

    const pageLayoutWidgetRepository =
      queryRunner.manager.getRepository<PageLayoutWidgetEntity>(
        PageLayoutWidgetEntity,
      );

    await pageLayoutWidgetRepository.insert({
      ...flatEntity,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<CreatePageLayoutWidgetAction>,
  ): Promise<void> {
    return;
  }
}
