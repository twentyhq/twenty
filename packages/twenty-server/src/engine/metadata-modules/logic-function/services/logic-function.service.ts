import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/services/application.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { LogicFunctionSourceBuilderService } from 'src/engine/core-modules/logic-function/logic-function-source-builder/logic-function-source-builder.service';
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
    private readonly logicFunctionSourceBuilderService: LogicFunctionSourceBuilderService,
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

    // Generate flat logic function to get the ID
    const flatLogicFunctionToCreate =
      fromCreateLogicFunctionInputToFlatLogicFunction({
        createLogicFunctionInput: input,
        workspaceId,
        ownerFlatApplication: resolvedOwnerFlatApplication,
      });

    // Seed the source files (uses provided code or default seed project)
    const { sourceHandlerPath, builtHandlerPath, checksum } =
      await this.logicFunctionSourceBuilderService.seedSourceFiles({
        logicFunctionId: flatLogicFunctionToCreate.id,
        workspaceId,
        applicationUniversalIdentifier:
          resolvedOwnerFlatApplication.universalIdentifier,
        code: input.code,
      });

    // Update paths and checksum with actual values from seeding
    flatLogicFunctionToCreate.sourceHandlerPath = sourceHandlerPath;
    flatLogicFunctionToCreate.builtHandlerPath = builtHandlerPath;
    flatLogicFunctionToCreate.checksum = checksum;

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

    return flatLogicFunctionToCreate;
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

    return this.getFlatLogicFunctionAfterUpdate(
      optimisticallyUpdatedFlatLogicFunction.id,
      workspaceId,
    );
  }

  async updateChecksum({
    id,
    checksum,
    workspaceId,
  }: {
    id: string;
    checksum: string;
    workspaceId: string;
  }) {
    const resolvedOwnerFlatApplication = (
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

    const flatLogicFunction = findFlatLogicFunctionOrThrow({
      id,
      flatLogicFunctionMaps,
    });

    const optimisticallyUpdatedFlatLogicFunction = {
      ...flatLogicFunction,
      checksum,
    };

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
        'Multiple validation errors occurred while updating logic function checksum',
      );
    }
  }

  private async getFlatLogicFunctionAfterUpdate(
    id: string,
    workspaceId: string,
  ) {
    const { flatLogicFunctionMaps: recomputedExistingFlatLogicFunctionMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatLogicFunctionMaps'],
        },
      );

    return findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: id,
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
}
