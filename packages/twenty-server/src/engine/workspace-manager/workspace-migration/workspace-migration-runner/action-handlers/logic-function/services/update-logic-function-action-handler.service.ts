import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/services/logic-function-executor.service';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';
import { FlatUpdateLogicFunctionAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/logic-function/types/workspace-migration-logic-function-action.type';
import { fromFlatEntityPropertiesUpdatesToPartialFlatEntity } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/from-flat-entity-properties-updates-to-partial-flat-entity';

@Injectable()
export class UpdateLogicFunctionActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update',
  'logicFunction',
) {
  constructor(
    private readonly logicFunctionExecutorService: LogicFunctionExecutorService,
  ) {
    super();
  }

  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<FlatUpdateLogicFunctionAction>,
  ): Promise<FlatUpdateLogicFunctionAction> {
    return context.action;
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatUpdateLogicFunctionAction>,
  ): Promise<void> {
    const { flatAction, queryRunner } = context;
    const { entityId } = flatAction;

    const logicFunctionRepository =
      queryRunner.manager.getRepository<LogicFunctionEntity>(
        LogicFunctionEntity,
      );

    await logicFunctionRepository.update(
      entityId,
      fromFlatEntityPropertiesUpdatesToPartialFlatEntity(flatAction),
    );

    const flatLogicFunction = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: entityId,
      flatEntityMaps: context.allFlatEntityMaps.flatLogicFunctionMaps,
    });

    for (const update of flatAction.updates) {
      if (update.property === 'deletedAt' && isDefined(update.to)) {
        await this.handleDeletedAtUpdate({
          flatLogicFunction,
        });
      }
    }
  }

  async handleDeletedAtUpdate({
    flatLogicFunction,
  }: {
    flatLogicFunction: FlatLogicFunction;
  }) {
    await this.logicFunctionExecutorService.delete(flatLogicFunction);

    await this.logicFunctionExecutorService.delete(flatLogicFunction);
  }
}
