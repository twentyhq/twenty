import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { ViewFilterEntity } from 'src/engine/metadata-modules/view-filter/entities/view-filter.entity';
import { UpdateViewFilterAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/view-filter/types/workspace-migration-view-filter-action-v2.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';
import { fromFlatEntityPropertiesUpdatesToPartialFlatEntity } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/from-flat-entity-properties-updates-to-partial-flat-entity';

@Injectable()
export class UpdateViewFilterActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update',
  'viewFilter',
) {
  constructor() {
    super();
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<UpdateViewFilterAction>,
  ): Promise<void> {
    const { action, queryRunner } = context;
    const { entityId } = action;

    const viewFilterRepository =
      queryRunner.manager.getRepository<ViewFilterEntity>(ViewFilterEntity);

    const update = fromFlatEntityPropertiesUpdatesToPartialFlatEntity(action);

    await viewFilterRepository.update(entityId, update);
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<UpdateViewFilterAction>,
  ): Promise<void> {
    return;
  }
}
