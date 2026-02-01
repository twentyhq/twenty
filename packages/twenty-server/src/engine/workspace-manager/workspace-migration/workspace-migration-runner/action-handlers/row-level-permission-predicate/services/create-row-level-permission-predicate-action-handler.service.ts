/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { RowLevelPermissionPredicateEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate.entity';
import { FlatCreateRowLevelPermissionPredicateAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/row-level-permission-predicate/types/workspace-migration-row-level-permission-predicate-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class CreateRowLevelPermissionPredicateActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create',
  'rowLevelPermissionPredicate',
) {
  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<FlatCreateRowLevelPermissionPredicateAction>,
  ): Promise<FlatCreateRowLevelPermissionPredicateAction> {
    return context.action;
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatCreateRowLevelPermissionPredicateAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;
    const { flatEntity } = flatAction;

    const repository =
      queryRunner.manager.getRepository<RowLevelPermissionPredicateEntity>(
        RowLevelPermissionPredicateEntity,
      );

    await repository.insert({
      ...flatEntity,
      workspaceId,
    });
  }

  async executeForWorkspaceSchema(
    _context: WorkspaceMigrationActionRunnerContext<FlatCreateRowLevelPermissionPredicateAction>,
  ): Promise<void> {
    return;
  }
}
