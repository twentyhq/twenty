import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { promises as fs } from 'fs';
import { dirname, join } from 'path';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';
import { FileFolder, Sources } from 'twenty-shared/types';
import { isObject } from '@sniptt/guards';

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
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { LogicFunctionBuildService } from 'src/engine/core-modules/logic-function/logic-function-build/services/logic-function-build.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { getLogicFunctionBaseFolderPath } from 'src/engine/core-modules/logic-function/logic-function-build/utils/get-logic-function-base-folder-path.util';
import { LambdaBuildDirectoryManager } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/lambda-build-directory-manager';
import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';

@Injectable()
export class UpdateLogicFunctionActionHandlerService extends WorkspaceMigrationRunnerActionHandler(
  'update',
  'logicFunction',
) {
  constructor(
    private readonly logicFunctionExecutorService: LogicFunctionExecutorService,
    private readonly functionBuildService: LogicFunctionBuildService,
    @InjectRepository(ApplicationEntity)
    private readonly applicationRepository: Repository<ApplicationEntity>,
    private readonly fileStorageService: FileStorageService,
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
    const { entityId, code } = flatAction;

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
    await this.logicFunctionExecutorService.delete(flatLogicFunction);
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

      const baseFolderPath = getLogicFunctionBaseFolderPath(
        flatLogicFunction.sourceHandlerPath,
      );

      await this.fileStorageService.uploadFolder_v2({
        workspaceId: flatLogicFunction.workspaceId,
        applicationUniversalIdentifier,
        fileFolder: FileFolder.Source,
        resourcePath: baseFolderPath,
        localPath: sourceTemporaryDir,
      });
    } catch (error) {
      this.logger.log(
        'workspace-migration-runner',
        `Error updating logic function ${flatLogicFunction.id}: ${error.message}`,
      );
    } finally {
      await lambdaBuildDirectoryManager.clean();
    }

    try {
      await this.functionBuildService.buildAndUpload({
        flatLogicFunction,
        applicationUniversalIdentifier,
      });
    } catch (error) {
      // TODO: logic should be improved
      this.logger.log(
        'workspace-migration-runner',
        `Error building and uploading logic function ${flatLogicFunction.id}: ${error.message}`,
      );
    }
  }
}
