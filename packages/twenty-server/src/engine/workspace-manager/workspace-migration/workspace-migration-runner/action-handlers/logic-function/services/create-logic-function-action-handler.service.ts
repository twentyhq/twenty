import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import crypto from 'crypto';

import { Repository } from 'typeorm';
import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { getSeedProjectFiles } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/get-seed-project-files';
import { getLogicFunctionBaseFolderPath } from 'src/engine/core-modules/logic-function/logic-function-build/utils/get-logic-function-base-folder-path.util';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';
import { FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import {
  WorkspaceMigrationActionRunnerArgs,
  WorkspaceMigrationActionRunnerContext,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';
import { FlatCreateLogicFunctionAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/logic-function/types/workspace-migration-logic-function-action.type';

@Injectable()
export class CreateLogicFunctionActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'create',
  'logicFunction',
) {
  constructor(
    private readonly fileStorageService: FileStorageService,
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

    let seedChecksum: string | undefined;

    if (!isDefined(logicFunction.checksum)) {
      seedChecksum = await this.seedLogicFunctionFiles(
        logicFunction,
        applicationUniversalIdentifier,
      );
    }

    const logicFunctionRepository =
      queryRunner.manager.getRepository<LogicFunctionEntity>(
        LogicFunctionEntity,
      );

    await logicFunctionRepository.insert({
      ...logicFunction,
      workspaceId,
      checksum: seedChecksum ?? logicFunction.checksum,
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

  private async seedLogicFunctionFiles(
    logicFunction: FlatLogicFunction,
    applicationUniversalIdentifier: string,
  ): Promise<string> {
    const seedProjectFiles = await getSeedProjectFiles;

    const sourceFiles = seedProjectFiles.filter((file) =>
      file.name.endsWith('index.ts'),
    );

    const builtFiles = seedProjectFiles.filter((file) =>
      file.name.endsWith('.mjs'),
    );

    if (sourceFiles.length !== 1 || builtFiles.length !== 1) {
      throw new LogicFunctionException(
        'Seed project should have one index.ts file and one index.mjs file',
        LogicFunctionExceptionCode.LOGIC_FUNCTION_CREATE_FAILED,
      );
    }

    const sourceFile = sourceFiles[0];
    const builtFile = builtFiles[0];

    await this.fileStorageService.writeFile_v2({
      workspaceId: logicFunction.workspaceId,
      applicationUniversalIdentifier,
      fileFolder: FileFolder.Source,
      resourcePath: logicFunction.sourceHandlerPath,
      sourceFile: sourceFile.content,
      mimeType: 'application/typescript',
      settings: {
        isTemporaryFile: false,
        toDelete: false,
      },
    });

    await this.fileStorageService.writeFile_v2({
      workspaceId: logicFunction.workspaceId,
      applicationUniversalIdentifier,
      fileFolder: FileFolder.BuiltLogicFunction,
      resourcePath: logicFunction.builtHandlerPath,
      sourceFile: builtFile.content,
      mimeType: 'application/javascript',
      settings: {
        isTemporaryFile: false,
        toDelete: false,
      },
    });

    return crypto.createHash('md5').update(builtFile.content).digest('hex');
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
