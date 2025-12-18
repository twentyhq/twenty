import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import type { CreateServerlessFunctionInput } from 'src/engine/metadata-modules/serverless-function/dtos/create-serverless-function.input';
import { ServerlessFunctionIdInput } from 'src/engine/metadata-modules/serverless-function/dtos/serverless-function-id.input';
import { UpdateServerlessFunctionInput } from 'src/engine/metadata-modules/serverless-function/dtos/update-serverless-function.input';
import {
  ServerlessFunctionException,
  ServerlessFunctionExceptionCode,
} from 'src/engine/metadata-modules/serverless-function/serverless-function.exception';
import { FlatServerlessFunction } from 'src/engine/metadata-modules/serverless-function/types/flat-serverless-function.type';
import { fromCreateServerlessFunctionInputToFlatServerlessFunction } from 'src/engine/metadata-modules/serverless-function/utils/from-create-serverless-function-input-to-flat-serverless-function.util';
import { fromUpdateServerlessFunctionInputToFlatServerlessFunctionToUpdateOrThrow } from 'src/engine/metadata-modules/serverless-function/utils/from-update-serverless-function-input-to-flat-serverless-function-to-update-or-throw.util';
import { WorkspaceMigrationBuilderExceptionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/exceptions/workspace-migration-builder-exception-v2';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration-v2/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class ServerlessFunctionV2Service {
  constructor(
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly applicationService: ApplicationService,
  ) {}

  async createOne({
    createServerlessFunctionInput,
    workspaceId,
    applicationId,
  }: {
    createServerlessFunctionInput: CreateServerlessFunctionInput & {
      serverlessFunctionLayerId: string;
    };
    /**
     * @deprecated do not use call validateBuildAndRunWorkspaceMigration contextually
     * when interacting with another application than workspace custom one
     * */
    applicationId?: string;
    workspaceId: string;
  }) {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );

    const flatServerlessFunctionToCreate =
      fromCreateServerlessFunctionInputToFlatServerlessFunction({
        createServerlessFunctionInput,
        workspaceId,
        workspaceCustomApplicationId:
          applicationId ?? workspaceCustomFlatApplication.id,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            serverlessFunction: {
              flatEntityToCreate: [flatServerlessFunctionToCreate],
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          isSystemBuild: false,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
        validateAndBuildResult,
        'Multiple validation errors occurred while creating serverless function',
      );
    }

    const {
      flatServerlessFunctionMaps: recomputedExistingFlatServerlessFunctionMaps,
    } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatServerlessFunctionMaps'],
        },
      );

    return findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: flatServerlessFunctionToCreate.id,
      flatEntityMaps: recomputedExistingFlatServerlessFunctionMaps,
    });
  }

  async updateOne(
    serverlessFunctionInput: UpdateServerlessFunctionInput,
    workspaceId: string,
  ) {
    const { flatServerlessFunctionMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatServerlessFunctionMaps'],
        },
      );

    const optimisticallyUpdatedFlatServerlessFunction =
      fromUpdateServerlessFunctionInputToFlatServerlessFunctionToUpdateOrThrow({
        flatServerlessFunctionMaps,
        updateServerlessFunctionInput: serverlessFunctionInput,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            serverlessFunction: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [optimisticallyUpdatedFlatServerlessFunction],
            },
          },
          workspaceId,
          isSystemBuild: false,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
        validateAndBuildResult,
        'Multiple validation errors occurred while updating serverless function',
      );
    }

    const {
      flatServerlessFunctionMaps: recomputedExistingFlatServerlessFunctionMaps,
    } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatServerlessFunctionMaps'],
        },
      );

    return findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: optimisticallyUpdatedFlatServerlessFunction.id,
      flatEntityMaps: recomputedExistingFlatServerlessFunctionMaps,
    });
  }

  async deleteOne({
    deleteServerlessFunctionInput,
    workspaceId,
    isSystemBuild = false,
  }: {
    deleteServerlessFunctionInput: ServerlessFunctionIdInput;
    workspaceId: string;
    isSystemBuild?: boolean;
  }): Promise<FlatServerlessFunction> {
    const { flatServerlessFunctionMaps: existingFlatServerlessFunctionMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatServerlessFunctionMaps'],
        },
      );

    const existingFlatServerlessFunction =
      existingFlatServerlessFunctionMaps.byId[deleteServerlessFunctionInput.id];

    if (!isDefined(existingFlatServerlessFunction)) {
      throw new ServerlessFunctionException(
        'Serverless function to delete not found',
        ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_NOT_FOUND,
      );
    }

    const optimisticallyUpdatedFlatServerlessFunctionWithDeletedAt = {
      ...existingFlatServerlessFunction,
      deletedAt: new Date().toISOString(),
    };

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            serverlessFunction: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [
                optimisticallyUpdatedFlatServerlessFunctionWithDeletedAt,
              ],
            },
          },
          workspaceId,
          isSystemBuild,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
        validateAndBuildResult,
        'Multiple validation errors occurred while deleting serverless function',
      );
    }

    const {
      flatServerlessFunctionMaps: recomputedExistingFlatServerlessFunctionMaps,
    } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatServerlessFunctionMaps'],
        },
      );

    return findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: optimisticallyUpdatedFlatServerlessFunctionWithDeletedAt.id,
      flatEntityMaps: recomputedExistingFlatServerlessFunctionMaps,
    });
  }

  async destroyOne({
    destroyServerlessFunctionInput,
    workspaceId,
    isSystemBuild = false,
  }: {
    destroyServerlessFunctionInput: ServerlessFunctionIdInput;
    workspaceId: string;
    isSystemBuild?: boolean;
  }): Promise<FlatServerlessFunction> {
    const { flatServerlessFunctionMaps: existingFlatServerlessFunctionMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatServerlessFunctionMaps'],
        },
      );

    const existingFlatServerlessFunction =
      existingFlatServerlessFunctionMaps.byId[
        destroyServerlessFunctionInput.id
      ];

    if (!isDefined(existingFlatServerlessFunction)) {
      throw new ServerlessFunctionException(
        'Serverless function to destroy not found',
        ServerlessFunctionExceptionCode.SERVERLESS_FUNCTION_NOT_FOUND,
      );
    }

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            serverlessFunction: {
              flatEntityToCreate: [],
              flatEntityToDelete: [existingFlatServerlessFunction],
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          isSystemBuild,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
        validateAndBuildResult,
        'Multiple validation errors occurred while destroying serverless function',
      );
    }

    return existingFlatServerlessFunction;
  }
}
