import { Injectable } from '@nestjs/common';

import { FileFolder } from 'twenty-shared/types';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';
import { FlatCreateLogicFunctionAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/logic-function/types/workspace-migration-logic-function-action.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';

@Injectable()
export class CreateLogicFunctionActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create',
  'logicFunction',
) {
  constructor(private readonly fileStorageService: FileStorageService) {
    super();
  }

  override async transpileUniversalActionToFlatAction(
    context: WorkspaceMigrationActionRunnerArgs<FlatCreateLogicFunctionAction>,
  ): Promise<FlatCreateLogicFunctionAction> {
    return context.action;
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerContext<FlatCreateLogicFunctionAction>,
  ): Promise<void> {
    const { flatAction, queryRunner, workspaceId, flatApplication } = context;
    const { flatEntity: logicFunction } = flatAction;

    const applicationUniversalIdentifier = flatApplication.universalIdentifier;

    const [sourceExists, builtExists] = await Promise.all([
      this.fileStorageService.checkFileExists_v2({
        workspaceId,
        applicationUniversalIdentifier,
        fileFolder: FileFolder.Source,
        resourcePath: logicFunction.sourceHandlerPath,
      }),
      this.fileStorageService.checkFileExists_v2({
        workspaceId,
        applicationUniversalIdentifier,
        fileFolder: FileFolder.BuiltLogicFunction,
        resourcePath: logicFunction.builtHandlerPath,
      }),
    ]);

    if (!sourceExists || !builtExists) {
      throw new LogicFunctionException(
        `Logic function source or built file missing before create (source: ${sourceExists}, built: ${builtExists})`,
        LogicFunctionExceptionCode.LOGIC_FUNCTION_CREATE_FAILED,
      );
    }

    const logicFunctionRepository =
      queryRunner.manager.getRepository<LogicFunctionEntity>(
        LogicFunctionEntity,
      );

    await logicFunctionRepository.insert({
      ...logicFunction,
      workspaceId,
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
