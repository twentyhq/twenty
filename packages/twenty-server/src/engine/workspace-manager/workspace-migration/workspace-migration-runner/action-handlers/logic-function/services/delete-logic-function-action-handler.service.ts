import { Inject, Injectable } from '@nestjs/common';

import { FileFolder } from 'twenty-shared/types';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
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
import { getLogicFunctionSubfolderForFromSource } from 'src/engine/metadata-modules/logic-function/utils/get-logic-function-subfolder-for-from-source';

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
    const {
      flatAction,
      queryRunner,
      workspaceId,
      allFlatEntityMaps,
      flatApplication,
    } = context;

    const flatLogicFunction = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityMaps: allFlatEntityMaps.flatLogicFunctionMaps,
      flatEntityId: flatAction.entityId,
    });

    const logicFunctionRepository =
      queryRunner.manager.getRepository<LogicFunctionEntity>(
        LogicFunctionEntity,
      );

    await logicFunctionRepository.delete({
      id: flatAction.entityId,
      workspaceId,
    });

    const applicationUniversalIdentifier = flatApplication.universalIdentifier;

    await this.fileStorageService.deleteFolder({
      workspaceId,
      applicationUniversalIdentifier,
      fileFolder: FileFolder.Source,
      folderPath: getLogicFunctionSubfolderForFromSource(flatLogicFunction.id),
    });

    await this.fileStorageService.deleteFile({
      workspaceId,
      applicationUniversalIdentifier,
      fileFolder: FileFolder.BuiltLogicFunction,
      resourcePath: flatLogicFunction.builtHandlerPath,
    });

    // Best-effort: release the function's runtime resource (e.g. the Lambda
    // function). Must never wedge metadata deletion, so failures are logged and
    // swallowed. LOCAL/DISABLED drivers no-op, and the Lambda driver tolerates
    // an already-deleted function.
    try {
      const driver = this.logicFunctionDriverFactory.getCurrentDriver();

      await driver.delete(flatLogicFunction);
    } catch (error) {
      this.logger.warn(
        `Failed to delete runtime resource for logic function ${flatLogicFunction.id}: ${error instanceof Error ? error.message : String(error)}`,
        DeleteLogicFunctionActionHandlerService.name,
      );
    }
  }

  async rollbackForMetadata(): Promise<void> {}
}
