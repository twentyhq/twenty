import { Inject, Injectable } from '@nestjs/common';

import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { LOGIC_FUNCTION_DRIVER_FACTORY_TOKEN } from 'src/engine/core-modules/logic-function/logic-function-drivers/constants/logic-function-driver-factory.token';
import { getLogicFunctionSubfolderForFromSource } from 'src/engine/metadata-modules/logic-function/utils/get-logic-function-subfolder-for-from-source';
import { DeferredWorkspaceMigrationActionHandlerDecorator } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/deferred-action-handlers/decorators/deferred-workspace-migration-action-handler.decorator';
import { type DeferredWorkspaceMigrationActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/deferred-action-handlers/interfaces/deferred-workspace-migration-action-handler.interface';
import { type DeferredWorkspaceMigrationActionExecutionArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-migration-action-execution-args.type';
import { type DeferredWorkspaceMigrationActionPayload } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-migration-action.type';

import type { LogicFunctionDriverFactory } from 'src/engine/core-modules/logic-function/logic-function-drivers/logic-function-driver.factory';

@Injectable()
@DeferredWorkspaceMigrationActionHandlerDecorator(
  'delete_logicFunctionResources',
)
export class DeleteLogicFunctionResourcesDeferredActionHandlerService implements DeferredWorkspaceMigrationActionHandler<'delete_logicFunctionResources'> {
  readonly metadataNamesToLoad = ['logicFunction' as const];

  constructor(
    private readonly fileStorageService: FileStorageService,
    @Inject(LOGIC_FUNCTION_DRIVER_FACTORY_TOKEN)
    private readonly logicFunctionDriverFactory: LogicFunctionDriverFactory,
  ) {}

  async execute({
    workspaceId,
    applicationUniversalIdentifier,
    payload: { flatLogicFunction },
  }: DeferredWorkspaceMigrationActionExecutionArgs<
    DeferredWorkspaceMigrationActionPayload<'delete_logicFunctionResources'>
  >): Promise<void> {
    const results = await Promise.allSettled([
      this.fileStorageService.deleteFolder({
        workspaceId,
        applicationUniversalIdentifier,
        fileFolder: FileFolder.Source,
        folderPath: getLogicFunctionSubfolderForFromSource(
          flatLogicFunction.id,
        ),
      }),
      this.fileStorageService.deleteFile({
        workspaceId,
        applicationUniversalIdentifier,
        fileFolder: FileFolder.BuiltLogicFunction,
        resourcePath: flatLogicFunction.builtHandlerPath,
      }),
      this.logicFunctionDriverFactory
        .getCurrentDriver()
        .delete(flatLogicFunction),
    ]);

    const failure = results.find(
      (result): result is PromiseRejectedResult => result.status === 'rejected',
    );

    if (isDefined(failure)) {
      throw failure.reason;
    }
  }
}
