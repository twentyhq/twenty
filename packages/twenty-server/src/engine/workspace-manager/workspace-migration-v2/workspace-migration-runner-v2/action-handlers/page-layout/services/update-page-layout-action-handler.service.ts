import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { PageLayoutEntity } from 'src/engine/metadata-modules/page-layout/entities/page-layout.entity';
import { UpdatePageLayoutAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/page-layout/types/workspace-migration-page-layout-action-v2.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';
import { fromFlatEntityPropertiesUpdatesToPartialFlatEntity } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/from-flat-entity-properties-updates-to-partial-flat-entity';

@Injectable()
export class UpdatePageLayoutActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update',
  'pageLayout',
) {
  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<UpdatePageLayoutAction>,
  ): Promise<void> {
    const { action, queryRunner, workspaceId } = context;
    const { entityId, updates } = action;

    const pageLayoutRepository =
      queryRunner.manager.getRepository<PageLayoutEntity>(PageLayoutEntity);

    await pageLayoutRepository.update(
      { id: entityId, workspaceId },
      fromFlatEntityPropertiesUpdatesToPartialFlatEntity({
        updates,
      }),
    );
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<UpdatePageLayoutAction>,
  ): Promise<void> {
    return;
  }
}
