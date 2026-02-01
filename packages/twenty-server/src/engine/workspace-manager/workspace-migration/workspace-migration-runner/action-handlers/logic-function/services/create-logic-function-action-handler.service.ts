import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { promises as fs } from 'fs';
import { dirname, join } from 'path';

import { Repository } from 'typeorm';
import { isObject } from '@sniptt/guards';
import { FileFolder, type Sources } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { getSeedProjectFiles } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/get-seed-project-files';
import { LambdaBuildDirectoryManager } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/lambda-build-directory-manager';
import { getLogicFunctionBaseFolderPath } from 'src/engine/core-modules/logic-function/logic-function-build/utils/get-logic-function-base-folder-path.util';
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
import { FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { LogicFunctionBuildService } from 'src/engine/core-modules/logic-function/logic-function-build/services/logic-function-build.service';

@Injectable()
export class CreateLogicFunctionActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create',
  'logicFunction',
) {
  constructor(
    private readonly fileStorageService: FileStorageService,
    private readonly functionBuildService: LogicFunctionBuildService,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
  ) {
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
    const { flatAction, queryRunner, workspaceId } = context;
    const { flatEntity: logicFunction } = flatAction;

    const applicationUniversalIdentifier =
      await this.getApplicationUniversalIdentifier(logicFunction.applicationId);

    await this.buildAndSaveLogicFunction(
      logicFunction,
      applicationUniversalIdentifier,
    );

    const logicFunctionRepository =
      queryRunner.manager.getRepository<LogicFunctionEntity>(
        LogicFunctionEntity,
      );

    await logicFunctionRepository.insert({
      ...logicFunction,
      workspaceId,
    });
  }

  private async getApplicationUniversalIdentifier(
    applicationId: string,
  ): Promise<string> {
    const application = await this.applicationRepository.findOne({
      where: { id: applicationId },
      select: ['universalIdentifier'],
    });

    if (!isDefined(application)) {
      throw new LogicFunctionException(
        `Application with id ${applicationId} not found`,
        LogicFunctionExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
      );
    }

    return application.universalIdentifier;
  }

  private async writeSourcesToLocalFolder(
    sources: Sources,
    localPath: string,
  ): Promise<void> {
    for (const key of Object.keys(sources)) {
      const filePath = join(localPath, key);
      const value = sources[key];

      if (isObject(value)) {
        await this.writeSourcesToLocalFolder(value as Sources, filePath);
        continue;
      }
      await fs.mkdir(dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, value);
    }
  }

  private async buildAndSaveLogicFunction(
    logicFunction: FlatLogicFunction,
    applicationUniversalIdentifier: string,
  ) {
    const lambdaBuildDirectoryManager = new LambdaBuildDirectoryManager();

    try {
      const { sourceTemporaryDir } = await lambdaBuildDirectoryManager.init();

      if (isDefined(logicFunction?.code)) {
        await this.writeSourcesToLocalFolder(
          logicFunction.code,
          sourceTemporaryDir,
        );
      } else {
        for (const file of await getSeedProjectFiles) {
          const filePath = join(sourceTemporaryDir, file.path, file.name);

          await fs.mkdir(join(sourceTemporaryDir, file.path), {
            recursive: true,
          });
          await fs.writeFile(filePath, file.content);
        }
      }

      const baseFolderPath = getLogicFunctionBaseFolderPath(
        logicFunction.sourceHandlerPath,
      );

      await this.fileStorageService.uploadFolder_v2({
        workspaceId: logicFunction.workspaceId,
        applicationUniversalIdentifier,
        fileFolder: FileFolder.Source,
        resourcePath: baseFolderPath,
        localPath: sourceTemporaryDir,
      });
    } finally {
      await lambdaBuildDirectoryManager.clean();
    }

    await this.functionBuildService.buildAndUpload({
      flatLogicFunction: logicFunction,
      applicationUniversalIdentifier,
    });
  }

  async rollbackForMetadata(
    context: Omit<
      WorkspaceMigrationActionRunnerArgs<FlatCreateLogicFunctionAction>,
      'queryRunner'
    >,
  ): Promise<void> {
    const { action } = context;

    const applicationUniversalIdentifier =
      await this.getApplicationUniversalIdentifier(
        action.flatEntity.applicationId,
      );

    const baseFolderPath = getLogicFunctionBaseFolderPath(
      action.flatEntity.sourceHandlerPath,
    );

    await this.fileStorageService.delete_v2({
      workspaceId: action.flatEntity.workspaceId,
      applicationUniversalIdentifier,
      fileFolder: FileFolder.Source,
      resourcePath: baseFolderPath,
    });
  }
}
