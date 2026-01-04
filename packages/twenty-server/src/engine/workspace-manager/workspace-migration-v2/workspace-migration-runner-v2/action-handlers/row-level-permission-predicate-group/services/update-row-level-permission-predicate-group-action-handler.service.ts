/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/interfaces/workspace-migration-runner-action-handler-service.interface';

import { RowLevelPermissionPredicateGroupEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate-group.entity';
import { UpdateRowLevelPermissionPredicateGroupAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/row-level-permission-predicate-group/types/workspace-migration-row-level-permission-predicate-group-action-v2.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/types/workspace-migration-action-runner-args.type';
import { fromFlatEntityPropertiesUpdatesToPartialFlatEntity } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/from-flat-entity-properties-updates-to-partial-flat-entity';

@Injectable()
export class UpdateRowLevelPermissionPredicateGroupActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update',
  'rowLevelPermissionPredicateGroup',
) {
  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<UpdateRowLevelPermissionPredicateGroupAction>,
  ): Promise<void> {
    const { action, queryRunner } = context;
    const { entityId } = action;

    const repository =
      queryRunner.manager.getRepository<RowLevelPermissionPredicateGroupEntity>(
        RowLevelPermissionPredicateGroupEntity,
      );

    const update = fromFlatEntityPropertiesUpdatesToPartialFlatEntity(action);

    await repository.update(entityId, update);
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerArgs<UpdateRowLevelPermissionPredicateGroupAction>,
  ): Promise<void> {
    return;
  }
}
