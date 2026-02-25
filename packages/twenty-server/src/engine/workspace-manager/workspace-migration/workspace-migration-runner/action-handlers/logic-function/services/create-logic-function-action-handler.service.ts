import { Injectable } from '@nestjs/common';

import { v4 } from 'uuid';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { getUniversalFlatEntityEmptyForeignKeyAggregators } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/reset-universal-flat-entity-foreign-key-aggregators.util';
import {
  FlatCreateLogicFunctionAction,
  UniversalCreateLogicFunctionAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/logic-function/types/workspace-migration-logic-function-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class CreateLogicFunctionActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create',
  'logicFunction',
) {
  override async transpileUniversalActionToFlatAction({
    action,
    flatApplication,
    workspaceId,
  }: WorkspaceMigrationActionRunnerArgs<UniversalCreateLogicFunctionAction>): Promise<FlatCreateLogicFunctionAction> {
    const emptyUniversalForeignKeyAggregators =
      getUniversalFlatEntityEmptyForeignKeyAggregators({
        metadataName: 'logicFunction',
      });

    return {
      ...action,
      flatEntity: {
        ...action.flatEntity,
        applicationId: flatApplication.id,
        id: action.id ?? v4(),
        workspaceId,
        ...emptyUniversalForeignKeyAggregators,
      },
    };
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatCreateLogicFunctionAction>,
  ): Promise<void> {
    const { flatAction, queryRunner } = context;
    const { flatEntity: logicFunction } = flatAction;

    await this.insertFlatEntitiesInRepository({
      queryRunner,
      flatEntities: [logicFunction],
    });
  }

  async rollbackForMetadata(
    _context: Omit<
      WorkspaceMigrationActionRunnerArgs<FlatCreateLogicFunctionAction>,
      'queryRunner'
    >,
  ): Promise<void> {
    // Nothing to rollback for now
    return;
  }
}
