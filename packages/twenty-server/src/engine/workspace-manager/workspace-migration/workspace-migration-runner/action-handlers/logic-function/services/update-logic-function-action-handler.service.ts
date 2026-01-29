import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { promises as fs } from 'fs';
import { join } from 'path';

import { Repository } from 'typeorm';
import { isObject } from '@sniptt/guards';
import { FileFolder, type Sources } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { WorkspaceMigrationRunnerActionHandler } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/interfaces/workspace-migration-runner-action-handler-service.interface';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function-executor/logic-function-executor.service';
import { LambdaBuildDirectoryManager } from 'src/engine/core-modules/logic-function-executor/drivers/utils/lambda-build-directory-manager';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { LOGIC_FUNCTION_CODE_SOURCE_PREFIX } from 'src/engine/metadata-modules/logic-function/constants/logic-function-code-source-prefix.constant';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';
import { FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { UpdateLogicFunctionAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/logic-function/types/workspace-migration-logic-function-action.type';
import { WorkspaceMigrationActionRunnerArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/types/workspace-migration-action-runner-args.type';
import { fromFlatEntityPropertiesUpdatesToPartialFlatEntity } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/from-flat-entity-properties-updates-to-partial-flat-entity';
import { FunctionBuildService } from 'src/engine/metadata-modules/function-build/function-build.service';

@Injectable()
export class UpdateLogicFunctionActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update',
  'logicFunction',
) {
  constructor(
    private readonly fileStorageService: FileStorageService,
    private readonly logicFunctionExecutorService: LogicFunctionExecutorService,
    private readonly functionBuildService: FunctionBuildService,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
  ) {
    super();
  }

  async executeForMetadata(
    context: WorkspaceMigrationActionRunnerArgs<UpdateLogicFunctionAction>,
  ): Promise<void> {
    const { action, queryRunner } = context;
    const { entityId, code } = action;

    const logicFunctionRepository =
      queryRunner.manager.getRepository<LogicFunctionEntity>(
        LogicFunctionEntity,
      );

    await logicFunctionRepository.update(
      entityId,
      fromFlatEntityPropertiesUpdatesToPartialFlatEntity(action),
    );

    const flatLogicFunction = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: entityId,
      flatEntityMaps: context.allFlatEntityMaps.flatLogicFunctionMaps,
    });

    for (const update of action.updates) {
      if (update.property === 'checksum' && isDefined(code)) {
        await this.handleChecksumUpdate({
          flatLogicFunction,
          code,
        });
      }
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
    this.logicFunctionExecutorService.delete(flatLogicFunction);
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
    await fs.mkdir(localPath, { recursive: true });
    for (const key of Object.keys(sources)) {
      const filePath = join(localPath, key);
      const value = sources[key];

      if (isObject(value)) {
        await this.writeSourcesToLocalFolder(value as Sources, filePath);
        continue;
      }
      await fs.writeFile(filePath, value);
    }
  }

  async handleChecksumUpdate({
    flatLogicFunction,
    code,
  }: {
    flatLogicFunction: FlatLogicFunction;
    code: Sources;
  }) {
    const applicationUniversalIdentifier =
      await this.getApplicationUniversalIdentifier(
        flatLogicFunction.applicationId,
      );

    const lambdaBuildDirectoryManager = new LambdaBuildDirectoryManager();

    try {
      const { sourceTemporaryDir } = await lambdaBuildDirectoryManager.init();

      await this.writeSourcesToLocalFolder(code, sourceTemporaryDir);

      await this.fileStorageService.uploadFolder_v2({
        workspaceId: flatLogicFunction.workspaceId,
        applicationUniversalIdentifier,
        fileFolder: FileFolder.Source,
        resourcePath: `${LOGIC_FUNCTION_CODE_SOURCE_PREFIX}/${flatLogicFunction.id}`,
        localPath: sourceTemporaryDir,
      });
    } finally {
      await lambdaBuildDirectoryManager.clean();
    }

    await this.functionBuildService.buildAndUpload({
      flatLogicFunction,
      applicationUniversalIdentifier,
    });
  }
}
