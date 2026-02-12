/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { RowLevelPermissionPredicateEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate.entity';
import {
  FlatDeleteRowLevelPermissionPredicateAction,
  UniversalDeleteRowLevelPermissionPredicateAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/row-level-permission-predicate/types/workspace-migration-row-level-permission-predicate-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteRowLevelPermissionPredicateActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete',
  'rowLevelPermissionPredicate',
) {
  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalDeleteRowLevelPermissionPredicateAction>,
  ): Promise<FlatDeleteRowLevelPermissionPredicateAction> {
    return this.transpileUniversalDeleteActionToFlatDeleteAction(context);
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatDeleteRowLevelPermissionPredicateAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;

    const repository =
      queryRunner.manager.getRepository<RowLevelPermissionPredicateEntity>(
        RowLevelPermissionPredicateEntity,
      );

    await repository.delete({
      id: flatAction.entityId,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatDeleteRowLevelPermissionPredicateAction>,
  ): Promise<void> {
    return;
  }
}
