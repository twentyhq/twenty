/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { RowLevelPermissionPredicateGroupEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate-group.entity';
import { FlatUpdateRowLevelPermissionPredicateGroupAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/row-level-permission-predicate-group/types/workspace-migration-row-level-permission-predicate-group-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class UpdateRowLevelPermissionPredicateGroupActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update',
  'rowLevelPermissionPredicateGroup',
) {
  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<FlatUpdateRowLevelPermissionPredicateGroupAction>,
  ): Promise<FlatUpdateRowLevelPermissionPredicateGroupAction> {
    return context.action;
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatUpdateRowLevelPermissionPredicateGroupAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;
    const { entityId, update } = flatAction;

    const repository =
      queryRunner.manager.getRepository<RowLevelPermissionPredicateGroupEntity>(
        RowLevelPermissionPredicateGroupEntity,
      );

    await repository.update({ id: entityId, workspaceId }, update);
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatUpdateRowLevelPermissionPredicateGroupAction>,
  ): Promise<void> {
    return;
  }
}
