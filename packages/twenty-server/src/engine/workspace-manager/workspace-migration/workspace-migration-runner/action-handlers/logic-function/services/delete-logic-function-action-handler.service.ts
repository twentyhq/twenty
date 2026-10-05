import { Inject, Injectable } from '@nestjs/common';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { LOGIC_FUNCTION_DRIVER_FACTORY_TOKEN } from 'src/engine/core-modules/logic-function/logic-function-drivers/constants/logic-function-driver-factory.token';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';

import type { LogicFunctionDriverFactory } from 'src/engine/core-modules/logic-function/logic-function-drivers/logic-function-driver.factory';
import {
  FlatDeleteLogicFunctionAction,
  UniversalDeleteLogicFunctionAction,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/logic-function/types/workspace-migration-logic-function-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class DeleteLogicFunctionActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'delete',
  'logicFunction',
) {
  constructor(
    private readonly fileStorageService: FileStorageService,
    @Inject(LOGIC_FUNCTION_DRIVER_FACTORY_TOKEN)
    private readonly logicFunctionDriverFactory: LogicFunctionDriverFactory,
  ) {
    super();
  }

  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<UniversalDeleteLogicFunctionAction>,
  ): Promise<FlatDeleteLogicFunctionAction> {
    return this.transpileUniversalDeleteActionToFlatDeleteAction(context);
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatDeleteLogicFunctionAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId } = context;

    const logicFunctionRepository =
      queryRunner.manager.getRepository<LogicFunctionEntity>(
        LogicFunctionEntity,
      );

    await logicFunctionRepository.delete({
      id: flatAction.entityId,
      workspaceId,
    });
  }

  protected override getDeferredAction({
    flatAction,
    allFlatEntityMaps,
  }: WorkspaceMigrationActionRunnerContext<FlatDeleteLogicFunctionAction>) {
    return {
      name: 'delete_logicFunctionResources' as const,
      payload: {
        flatLogicFunction: findFlatEntityByIdInFlatEntityMapsOrThrow({
          flatEntityMaps: allFlatEntityMaps.flatLogicFunctionMaps,
          flatEntityId: flatAction.entityId,
        }),
      },
    };
  }

  async rollbackForMetadata(): Promise<void> {}
}
