import { Injectable } from '@nestjs/common';

import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { getSeedProjectFiles } from 'src/engine/core-modules/logic-function-executor/drivers/utils/get-seed-project-files';
import { LOGIC_FUNCTION_CODE_SOURCE_PREFIX } from 'src/engine/metadata-modules/logic-function/constants/logic-function-code-source-prefix.constant';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { CreateLogicFunctionAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/logic-function/types/workspace-migration-logic-function-action.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';
import { FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { FunctionBuildService } from 'src/engine/metadata-modules/function-build/function-build.service';

@Injectable()
export class CreateLogicFunctionActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create',
  'logicFunction',
) {
  constructor(
    private readonly fileStorageService: FileStorageService,
    private readonly functionBuildService: FunctionBuildService,
  ) {
    super();
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<CreateLogicFunctionAction>,
  ): Promise<void> {
    const { action, queryRunner, workspaceId } = context;
    const { flatEntity: logicFunction } = action;

    await this.buildAndSaveLogicFunction(logicFunction);

    const logicFunctionRepository =
      queryRunner.manager.getRepository<LogicFunctionEntity>(
        LogicFunctionEntity,
      );

    await logicFunctionRepository.insert({
      ...logicFunction,
      workspaceId,
    });
  }

  private async buildAndSaveLogicFunction(logicFunction: FlatLogicFunction) {
    const sourceFolderPath = `workspace-${logicFunction.workspaceId}/${FileFolder.Source}/${LOGIC_FUNCTION_CODE_SOURCE_PREFIX}/${logicFunction.id}`;

    if (isDefined(logicFunction?.code)) {
      await this.fileStorageService.writeFolder(
        logicFunction.code,
        sourceFolderPath,
      );
    } else {
      for (const file of await getSeedProjectFiles) {
        await this.fileStorageService.writeFile({
          file: file.content,
          name: file.name,
          mimeType: 'application/typescript',
          folder: `${sourceFolderPath}/${file.path}`,
        });
      }
    }
    await this.functionBuildService.buildAndUpload({
      flatLogicFunction: logicFunction,
    });
  }

  async rollbackForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<CreateLogicFunctionAction>,
  ): Promise<void> {
    const { action } = context;

    const sourceFolderPath = `workspace-${action.flatEntity.workspaceId}/${FileFolder.Source}/${LOGIC_FUNCTION_CODE_SOURCE_PREFIX}/${action.flatEntity.id}`;

    await this.fileStorageService.delete({ folderPath: sourceFolderPath });
  }
}
