import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { ViewGroupEntity } from 'src/engine/metadata-modules/view-group/entities/view-group.entity';
import { UpdateViewGroupAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/view-group/types/workspace-migration-view-group-action-v2.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';
import { fromFlatEntityPropertiesUpdatesToPartialFlatEntity } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/from-flat-entity-properties-updates-to-partial-flat-entity';

@Injectable()
export class UpdateViewGroupActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update',
  'viewGroup',
) {
  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<UpdateViewGroupAction>,
  ): Promise<void> {
    const { action, queryRunner } = context;
    const { entityId } = action;

    const viewGroupRepository =
      queryRunner.manager.getRepository<ViewGroupEntity>(ViewGroupEntity);

    const update = fromFlatEntityPropertiesUpdatesToPartialFlatEntity(action);

    await viewGroupRepository.update(entityId, update);
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<UpdateViewGroupAction>,
  ): Promise<void> {
    return;
  }
}
