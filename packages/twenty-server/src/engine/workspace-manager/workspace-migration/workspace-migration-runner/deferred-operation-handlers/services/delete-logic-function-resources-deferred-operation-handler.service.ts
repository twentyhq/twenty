import { Inject, Injectable } from '@nestjs/common';

import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  FileStorageException,
  FileStorageExceptionCode,
} from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';
import { FileStorageService } from 'src/engine/core-modules/file-storage/services/file-storage.service';
import { LOGIC_FUNCTION_DRIVER_FACTORY_TOKEN } from 'src/engine/core-modules/logic-function/logic-function-drivers/constants/logic-function-driver-factory.token';
import { getLogicFunctionSubfolderForFromSource } from 'src/engine/metadata-modules/logic-function/utils/get-logic-function-subfolder-for-from-source';
import { DeferredWorkspaceOperationHandlerDecorator } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/deferred-operation-handlers/decorators/deferred-workspace-operation-handler.decorator';
import { type DeferredWorkspaceOperationHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/deferred-operation-handlers/interfaces/deferred-workspace-operation-handler.interface';
import { type DeferredWorkspaceOperationExecutionArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-operation-execution-args.type';
import { type DeferredWorkspaceOperationPayload } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/deferred-workspace-operation.type';

import type { LogicFunctionDriverFactory } from 'src/engine/core-modules/logic-function/logic-function-drivers/logic-function-driver.factory';

@Injectable()
@DeferredWorkspaceOperationHandlerDecorator('delete_logicFunctionResources')
export class DeleteLogicFunctionResourcesDeferredOperationHandlerService implements DeferredWorkspaceOperationHandler<'delete_logicFunctionResources'> {
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
  }: DeferredWorkspaceOperationExecutionArgs<
    DeferredWorkspaceOperationPayload<'delete_logicFunctionResources'>
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

    // Files already gone, e.g. with their uninstalled application, need no cleanup.
    const failure = results.find(
      (result): result is PromiseRejectedResult =>
        result.status === 'rejected' &&
        !(
          result.reason instanceof FileStorageException &&
          result.reason.code === FileStorageExceptionCode.FILE_NOT_FOUND
        ),
    );

    if (isDefined(failure)) {
      throw failure.reason;
    }
  }
}
