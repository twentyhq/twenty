import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { PageLayoutTabEntity } from 'src/engine/metadata-modules/page-layout-tab/entities/page-layout-tab.entity';
import { UpdatePageLayoutTabAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/page-layout-tab/types/workspace-migration-page-layout-tab-action-v2.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';
import { fromFlatEntityPropertiesUpdatesToPartialFlatEntity } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/from-flat-entity-properties-updates-to-partial-flat-entity';

@Injectable()
export class UpdatePageLayoutTabActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update',
  'pageLayoutTab',
) {
  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<UpdatePageLayoutTabAction>,
  ): Promise<void> {
    const { action, queryRunner, workspaceId } = context;
    const { entityId, updates } = action;

    const pageLayoutTabRepository =
      queryRunner.manager.getRepository<PageLayoutTabEntity>(
        PageLayoutTabEntity,
      );

    await pageLayoutTabRepository.update(
      { id: entityId, workspaceId },
      fromFlatEntityPropertiesUpdatesToPartialFlatEntity({
        updates,
      }),
    );
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<UpdatePageLayoutTabAction>,
  ): Promise<void> {
    return;
  }
}
