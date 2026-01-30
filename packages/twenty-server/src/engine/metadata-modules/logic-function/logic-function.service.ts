import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { FileStorageExceptionCode } from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';
import { type LogicFunctionExecuteResult } from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-executor-driver.interface';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { LogicFunctionBuildService } from 'src/engine/core-modules/logic-function/logic-function-build/services/logic-function-build.service';
import { getLogicFunctionBaseFolderPath } from 'src/engine/core-modules/logic-function/logic-function-build/utils/get-logic-function-base-folder-path.util';
import {
  LogicFunctionExecutionException,
  LogicFunctionExecutionExceptionCode,
  LogicFunctionExecutorService,
} from 'src/engine/core-modules/logic-function/logic-function-executor/services/logic-function-executor.service';
import { LogicFunctionLayerService } from 'src/engine/core-modules/logic-function/logic-function-layer/services/logic-function-layer.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { CreateLogicFunctionInput } from 'src/engine/metadata-modules/logic-function/dtos/create-logic-function.input';
import { type UpdateLogicFunctionInput } from 'src/engine/metadata-modules/logic-function/dtos/update-logic-function.input';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { findFlatLogicFunctionOrThrow } from 'src/engine/metadata-modules/logic-function/utils/find-flat-logic-function-or-throw.util';
import { fromCreateLogicFunctionInputToFlatLogicFunction } from 'src/engine/metadata-modules/logic-function/utils/from-create-logic-function-input-to-flat-logic-function.util';
import { fromUpdateLogicFunctionInputToFlatLogicFunctionToUpdateOrThrow } from 'src/engine/metadata-modules/logic-function/utils/from-update-logic-function-input-to-flat-logic-function-to-update-or-throw.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class LogicFunctionService {
  constructor(
    private readonly fileStorageService: FileStorageService,
    private readonly functionBuildService: LogicFunctionBuildService,
    private readonly logicFunctionLayerService: LogicFunctionLayerService,
    private readonly logicFunctionExecutorService: LogicFunctionExecutorService,
    @InjectRepository(LogicFunctionEntity)
    private readonly logicFunctionRepository: Repository<LogicFunctionEntity>,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async getLogicFunctionSourceCode(workspaceId: string, id: string) {
    try {
      const { flatLogicFunctionMaps, flatApplicationMaps } =
        await this.workspaceCacheService.getOrRecompute(workspaceId, [
          'flatLogicFunctionMaps',
          'flatApplicationMaps',
        ]);

      const flatLogicFunction = findFlatLogicFunctionOrThrow({
        id,
        flatLogicFunctionMaps,
      });

      const applicationUniversalIdentifier = isDefined(
        flatLogicFunction.applicationId,
      )
        ? flatApplicationMaps.byId[flatLogicFunction.applicationId]
            ?.universalIdentifier
        : undefined;

      if (!isDefined(applicationUniversalIdentifier)) {
        throw new LogicFunctionException(
          `Application universal identifier not found for logic function ${id}`,
          LogicFunctionExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
        );
      }

      const baseFolderPath = getLogicFunctionBaseFolderPath(
        flatLogicFunction.sourceHandlerPath,
      );

      return await this.fileStorageService.readFolder_v2({
        workspaceId,
        applicationUniversalIdentifier,
        fileFolder: FileFolder.Source,
        resourcePath: baseFolderPath,
      });
    } catch (error) {
      if (error.code === FileStorageExceptionCode.FILE_NOT_FOUND) {
        return;
      }
      throw error;
    }
  }

  async executeOneLogicFunction({
    id,
    workspaceId,
    payload,
  }: {
    id: string;
    workspaceId: string;
    payload: object;
  }): Promise<LogicFunctionExecuteResult> {
    try {
      return await this.logicFunctionExecutorService.executeOneLogicFunction({
        id,
        workspaceId,
        payload,
      });
    } catch (error) {
      if (error instanceof LogicFunctionExecutionException) {
        switch (error.code) {
          case LogicFunctionExecutionExceptionCode.LOGIC_FUNCTION_NOT_FOUND:
            throw new LogicFunctionException(
              error.message,
              LogicFunctionExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
            );
          case LogicFunctionExecutionExceptionCode.RATE_LIMIT_EXCEEDED:
            throw new LogicFunctionException(
              error.message,
              LogicFunctionExceptionCode.LOGIC_FUNCTION_EXECUTION_LIMIT_REACHED,
            );
        }
      }
      throw error;
    }
  }

  async deleteOneLogicFunction({
    id,
    workspaceId,
    softDelete = false,
  }: {
    id: string;
    workspaceId: string;
    softDelete?: boolean;
  }): Promise<FlatLogicFunction> {
    const { flatLogicFunctionMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatLogicFunctionMaps'],
        },
      );

    const existingFlatLogicFunction = flatLogicFunctionMaps.byId[id];

    if (!isDefined(existingFlatLogicFunction)) {
      throw new LogicFunctionException(
        'Logic function to delete not found',
        LogicFunctionExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
      );
    }

    if (softDelete) {
      const updatedFlatLogicFunctionWithDeletedAt: FlatLogicFunction = {
        ...existingFlatLogicFunction,
        deletedAt: new Date().toISOString(),
      };

      const validateAndBuildResult =
        await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
          {
            allFlatEntityOperationByMetadataName: {
              logicFunction: {
                flatEntityToCreate: [],
                flatEntityToDelete: [],
                flatEntityToUpdate: [updatedFlatLogicFunctionWithDeletedAt],
              },
            },
            workspaceId,
            isSystemBuild: false,
          },
        );

      if (isDefined(validateAndBuildResult)) {
        throw new WorkspaceMigrationBuilderException(
          validateAndBuildResult,
          'Multiple validation errors occurred while deleting logic function',
        );
      }

      return updatedFlatLogicFunctionWithDeletedAt;
    } else {
      const validateAndBuildResult =
        await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
          {
            allFlatEntityOperationByMetadataName: {
              logicFunction: {
                flatEntityToCreate: [],
                flatEntityToDelete: [existingFlatLogicFunction],
                flatEntityToUpdate: [],
              },
            },
            workspaceId,
            isSystemBuild: false,
          },
        );

      if (isDefined(validateAndBuildResult)) {
        throw new WorkspaceMigrationBuilderException(
          validateAndBuildResult,
          'Multiple validation errors occurred while destroying logic function',
        );
      }
    }

    return existingFlatLogicFunction;
  }

  async restoreOneLogicFunction(
    id: string,
    workspaceId: string,
  ): Promise<FlatLogicFunction> {
    const { flatLogicFunctionMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatLogicFunctionMaps'],
        },
      );

    const existingFlatLogicFunction = flatLogicFunctionMaps.byId[id];

    if (!isDefined(existingFlatLogicFunction)) {
      throw new LogicFunctionException(
        'Logic function to restore not found',
        LogicFunctionExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
      );
    }

    const restoredFlatLogicFunction: FlatLogicFunction = {
      ...existingFlatLogicFunction,
      deletedAt: null,
    };

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            logicFunction: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [restoredFlatLogicFunction],
            },
          },
          workspaceId,
          isSystemBuild: false,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while restoring logic function',
      );
    }

    const { flatLogicFunctionMaps: recomputedFlatLogicFunctionMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatLogicFunctionMaps'],
        },
      );

    return findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: id,
      flatEntityMaps: recomputedFlatLogicFunctionMaps,
    });
  }

  async updateOneLogicFunction(
    logicFunctionInput: UpdateLogicFunctionInput,
    workspaceId: string,
  ): Promise<FlatLogicFunction> {
    const { flatLogicFunctionMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatLogicFunctionMaps'],
        },
      );

    const updatedFlatLogicFunction =
      fromUpdateLogicFunctionInputToFlatLogicFunctionToUpdateOrThrow({
        flatLogicFunctionMaps,
        updateLogicFunctionInput: logicFunctionInput,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            logicFunction: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [updatedFlatLogicFunction],
            },
          },
          workspaceId,
          isSystemBuild: false,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while updating logic function',
      );
    }

    const { flatLogicFunctionMaps: recomputedFlatLogicFunctionMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatLogicFunctionMaps'],
        },
      );

    return findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: updatedFlatLogicFunction.id,
      flatEntityMaps: recomputedFlatLogicFunctionMaps,
    });
  }

  async getAvailablePackages(logicFunctionId: string) {
    const logicFunction = await this.logicFunctionRepository.findOneOrFail({
      where: { id: logicFunctionId },
      relations: ['logicFunctionLayer'],
    });

    const packageJson = logicFunction.logicFunctionLayer.packageJson;

    const yarnLock = logicFunction.logicFunctionLayer.yarnLock;

    const packageVersionRegex = /^"([^@]+)@.*?":\n\s+version: (.+)$/gm;

    const versions: Record<string, string> = {};

    let match: RegExpExecArray | null;

    while ((match = packageVersionRegex.exec(yarnLock)) !== null) {
      const packageName = match[1].split('@', 1)[0];
      const version = match[2];

      // @ts-expect-error legacy noImplicitAny
      if (packageJson.dependencies?.[packageName]) {
        versions[packageName] = version;
      }
    }

    return versions;
  }

  async createOneLogicFunction(
    logicFunctionInput: CreateLogicFunctionInput & {
      logicFunctionLayerId?: string;
    },
    workspaceId: string,
  ): Promise<FlatLogicFunction> {
    let logicFunctionToCreateLayerId = logicFunctionInput.logicFunctionLayerId;

    if (!isDefined(logicFunctionToCreateLayerId)) {
      const { id: commonLogicFunctionLayerId } =
        await this.logicFunctionLayerService.createCommonLayerIfNotExist(
          workspaceId,
        );

      logicFunctionToCreateLayerId = commonLogicFunctionLayerId;
    }

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );

    const flatLogicFunctionToCreate =
      fromCreateLogicFunctionInputToFlatLogicFunction({
        createLogicFunctionInput: {
          ...logicFunctionInput,
          logicFunctionLayerId: logicFunctionToCreateLayerId,
        },
        workspaceId,
        workspaceCustomApplicationId:
          logicFunctionInput.applicationId ?? workspaceCustomFlatApplication.id,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            logicFunction: {
              flatEntityToCreate: [flatLogicFunctionToCreate],
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          isSystemBuild: false,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while creating logic function',
      );
    }

    const { flatLogicFunctionMaps: recomputedFlatLogicFunctionMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatLogicFunctionMaps'],
        },
      );

    return findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: flatLogicFunctionToCreate.id,
      flatEntityMaps: recomputedFlatLogicFunctionMaps,
    });
  }

  async duplicateLogicFunction({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }): Promise<FlatLogicFunction> {
    return this.createLogicFunctionFromExistingLogicFunctionById({
      id,
      workspaceId,
    });
  }

  async createLogicFunctionFromExistingLogicFunctionById({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }): Promise<FlatLogicFunction> {
    const { flatLogicFunctionMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatLogicFunctionMaps'],
        },
      );

    const existingLogicFunction = findFlatLogicFunctionOrThrow({
      id,
      flatLogicFunctionMaps,
    });

    return this.createLogicFunctionFromExistingLogicFunction({
      existingLogicFunction,
      workspaceId,
    });
  }

  async createLogicFunctionFromExistingLogicFunction({
    existingLogicFunction,
    workspaceId,
  }: {
    existingLogicFunction: FlatLogicFunction;
    workspaceId: string;
  }): Promise<FlatLogicFunction> {
    const { flatApplicationMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatApplicationMaps',
      ]);

    const existingApplicationUniversalIdentifier = isDefined(
      existingLogicFunction.applicationId,
    )
      ? flatApplicationMaps.byId[existingLogicFunction.applicationId]
          ?.universalIdentifier
      : undefined;

    if (!isDefined(existingApplicationUniversalIdentifier)) {
      throw new LogicFunctionException(
        `Application universal identifier not found for logic function ${existingLogicFunction.id}`,
        LogicFunctionExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
      );
    }

    const newFlatLogicFunction = await this.createOneLogicFunction(
      {
        name: existingLogicFunction.name,
        description: existingLogicFunction.description ?? undefined,
        timeoutSeconds: existingLogicFunction.timeoutSeconds,
        applicationId: existingLogicFunction.applicationId ?? undefined,
        logicFunctionLayerId: existingLogicFunction.logicFunctionLayerId,
      },
      workspaceId,
    );

    const newApplicationUniversalIdentifier = isDefined(
      newFlatLogicFunction.applicationId,
    )
      ? flatApplicationMaps.byId[newFlatLogicFunction.applicationId]
          ?.universalIdentifier
      : undefined;

    if (!isDefined(newApplicationUniversalIdentifier)) {
      throw new LogicFunctionException(
        `Application universal identifier not found for logic function ${newFlatLogicFunction.id}`,
        LogicFunctionExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
      );
    }

    const fromBaseFolderPath = getLogicFunctionBaseFolderPath(
      existingLogicFunction.sourceHandlerPath,
    );
    const toBaseFolderPath = getLogicFunctionBaseFolderPath(
      newFlatLogicFunction.sourceHandlerPath,
    );

    await this.fileStorageService.copy_v2({
      from: {
        workspaceId,
        applicationUniversalIdentifier: existingApplicationUniversalIdentifier,
        fileFolder: FileFolder.Source,
        resourcePath: fromBaseFolderPath,
      },
      to: {
        workspaceId,
        applicationUniversalIdentifier: newApplicationUniversalIdentifier,
        fileFolder: FileFolder.Source,
        resourcePath: toBaseFolderPath,
      },
    });

    return newFlatLogicFunction;
  }
}
