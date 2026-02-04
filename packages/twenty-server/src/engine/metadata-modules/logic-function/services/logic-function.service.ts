import { Injectable } from '@nestjs/common';

import { FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/services/application.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { getLogicFunctionBaseFolderPath } from 'src/engine/core-modules/logic-function/logic-function-build/utils/get-logic-function-base-folder-path.util';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import type { CreateLogicFunctionInput } from 'src/engine/metadata-modules/logic-function/dtos/create-logic-function.input';
import type { UpdateLogicFunctionInput } from 'src/engine/metadata-modules/logic-function/dtos/update-logic-function.input';
import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';
import { FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { findFlatLogicFunctionOrThrow } from 'src/engine/metadata-modules/logic-function/utils/find-flat-logic-function-or-throw.util';
import { fromCreateLogicFunctionInputToFlatLogicFunction } from 'src/engine/metadata-modules/logic-function/utils/from-create-logic-function-input-to-flat-logic-function.util';
import { fromUpdateLogicFunctionInputToFlatLogicFunctionToUpdateOrThrow } from 'src/engine/metadata-modules/logic-function/utils/from-update-logic-function-input-to-flat-logic-function-to-update-or-throw.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class LogicFunctionService {
  constructor(
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly fileStorageService: FileStorageService,
  ) {}

  async createOne({
    input,
    workspaceId,
    ownerFlatApplication,
  }: {
    input: Omit<CreateLogicFunctionInput, 'applicationId'>;
    ownerFlatApplication?: FlatApplication;
    workspaceId: string;
    applicationId?: string;
  }) {
    const resolvedOwnerFlatApplication =
      ownerFlatApplication ??
      (
        await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
          { workspaceId },
        )
      ).workspaceCustomFlatApplication;

    const flatLogicFunctionToCreate =
      fromCreateLogicFunctionInputToFlatLogicFunction({
        createLogicFunctionInput: input,
        workspaceId,
        ownerFlatApplication: resolvedOwnerFlatApplication,
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
          applicationUniversalIdentifier:
            resolvedOwnerFlatApplication.universalIdentifier,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while creating logic function',
      );
    }

    const { flatLogicFunctionMaps: recomputedExistingFlatLogicFunctionMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatLogicFunctionMaps'],
        },
      );

    return findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: flatLogicFunctionToCreate.id,
      flatEntityMaps: recomputedExistingFlatLogicFunctionMaps,
    });
  }

  async updateOne({
    id,
    update,
    workspaceId,
    ownerFlatApplication,
  }: {
    id: string;
    update: UpdateLogicFunctionInput['update'];
    workspaceId: string;
    ownerFlatApplication?: FlatApplication;
  }) {
    const resolvedOwnerFlatApplication =
      ownerFlatApplication ??
      (
        await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
          { workspaceId },
        )
      ).workspaceCustomFlatApplication;

    const { flatLogicFunctionMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatLogicFunctionMaps'],
        },
      );

    const optimisticallyUpdatedFlatLogicFunction =
      fromUpdateLogicFunctionInputToFlatLogicFunctionToUpdateOrThrow({
        flatLogicFunctionMaps,
        updateLogicFunctionInput: { id, update },
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            logicFunction: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [optimisticallyUpdatedFlatLogicFunction],
            },
          },
          workspaceId,
          isSystemBuild: false,
          applicationUniversalIdentifier:
            resolvedOwnerFlatApplication.universalIdentifier,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while updating logic function',
      );
    }

    const { flatLogicFunctionMaps: recomputedExistingFlatLogicFunctionMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatLogicFunctionMaps'],
        },
      );

    return findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: optimisticallyUpdatedFlatLogicFunction.id,
      flatEntityMaps: recomputedExistingFlatLogicFunctionMaps,
    });
  }

  async destroyOne({
    id,
    workspaceId,
    applicationId: _applicationId,
    isSystemBuild = false,
    ownerFlatApplication,
  }: {
    id: string;
    workspaceId: string;
    applicationId?: string;
    isSystemBuild?: boolean;
    ownerFlatApplication?: FlatApplication;
  }): Promise<FlatLogicFunction> {
    const resolvedOwnerFlatApplication =
      ownerFlatApplication ??
      (
        await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
          { workspaceId },
        )
      ).workspaceCustomFlatApplication;

    const { flatLogicFunctionMaps: existingFlatLogicFunctionMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatLogicFunctionMaps'],
        },
      );

    const existingFlatLogicFunction = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: id,
      flatEntityMaps: existingFlatLogicFunctionMaps,
    });

    if (!isDefined(existingFlatLogicFunction)) {
      throw new LogicFunctionException(
        'Logic function to destroy not found',
        LogicFunctionExceptionCode.LOGIC_FUNCTION_NOT_FOUND,
      );
    }

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
          isSystemBuild,
          applicationUniversalIdentifier:
            resolvedOwnerFlatApplication.universalIdentifier,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderException(
        validateAndBuildResult,
        'Multiple validation errors occurred while destroying logic function',
      );
    }

    return existingFlatLogicFunction;
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

    const newFlatLogicFunction = await this.createOne({
      input: {
        name: existingLogicFunction.name,
        description: existingLogicFunction.description ?? undefined,
        timeoutSeconds: existingLogicFunction.timeoutSeconds,
      },
      workspaceId,
      applicationId: existingLogicFunction.applicationId ?? undefined,
    });

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
