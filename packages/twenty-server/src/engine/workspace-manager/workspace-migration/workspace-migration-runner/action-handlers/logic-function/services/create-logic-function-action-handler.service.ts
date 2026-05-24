import { Inject, Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { LOGIC_FUNCTION_DRIVER_FACTORY_TOKEN } from 'src/engine/core-modules/logic-function/logic-function-drivers/constants/logic-function-driver-factory.token';
import { LogicFunctionExecutionMode } from 'src/engine/metadata-modules/logic-function/logic-function.entity';

import type { LogicFunctionDriverFactory } from 'src/engine/core-modules/logic-function/logic-function-drivers/logic-function-driver.factory';
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
  constructor(
    @Inject(LOGIC_FUNCTION_DRIVER_FACTORY_TOKEN)
    private readonly logicFunctionDriverFactory: LogicFunctionDriverFactory,
  ) {
    super();
  }

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
    const { flatAction, queryRunner, flatApplication } = context;
    const { flatEntity: logicFunction } = flatAction;

    await this.insertFlatEntitiesInRepository({
      queryRunner,
      flatEntities: [logicFunction],
    });

    if (
      logicFunction.executionMode === LogicFunctionExecutionMode.PREBUILT &&
      logicFunction.isBuildUpToDate &&
      isDefined(logicFunction.checksum)
    ) {
      const driver = this.logicFunctionDriverFactory.getCurrentDriver();

      const installStart = Date.now();

      try {
        await driver.installPrebuiltBundle({
          flatLogicFunction: logicFunction,
          flatApplication,
          applicationUniversalIdentifier: flatApplication.universalIdentifier,
        });

        this.logger.log(
          `[lambda-timing] event=install_prebuilt fnId=${logicFunction.id} ` +
            `reason=app_install install_duration_ms=${Date.now() - installStart}`,
          CreateLogicFunctionActionHandlerService.name,
        );
      } catch (error) {
        this.logger.error(
          `Failed to install prebuilt bundle on app-install for function ${logicFunction.id} ` +
            `after ${Date.now() - installStart}ms: ` +
            `${error instanceof Error ? error.message : String(error)}`,
          CreateLogicFunctionActionHandlerService.name,
          error instanceof Error ? error.stack : undefined,
        );
        throw error;
      }
    }
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
