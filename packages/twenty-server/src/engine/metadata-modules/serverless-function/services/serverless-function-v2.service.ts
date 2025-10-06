import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/core-modules/common/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { deleteFlatEntityFromFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/delete-flat-entity-from-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { getSubFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/get-sub-flat-entity-maps-or-throw.util';
import { replaceFlatEntityInFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/replace-flat-entity-in-flat-entity-maps-or-throw.util';
import { CreateServerlessFunctionInput } from 'src/engine/metadata-modules/serverless-function/dtos/create-serverless-function.input';
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
  ) {}

  async createOne(
    serverlessFunctionInput: CreateServerlessFunctionInput,
    workspaceId: string,
  ) {
    const flatEntityMaps =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatServerlessFunctionMaps'],
        },
      );

    const existingFlatServerlessFunctionMaps =
      flatEntityMaps.flatServerlessFunctionMaps;

    const flatServerlessFunctionToCreate =
      fromCreateServerlessFunctionInputToFlatServerlessFunction({
        createServerlessFunctionInput: serverlessFunctionInput,
        workspaceId,
      });

    const toFlatServerlessFunctionMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: flatServerlessFunctionToCreate,
      flatEntityMaps: existingFlatServerlessFunctionMaps,
    });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          workspaceId,
          fromToAllFlatEntityMaps: {
            flatServerlessFunctionMaps: {
              from: existingFlatServerlessFunctionMaps,
              to: toFlatServerlessFunctionMaps,
            },
          },
          buildOptions: {
            isSystemBuild: false,
            inferDeletionFromMissingEntities: false,
          },
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
    const flatEntityMaps =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatServerlessFunctionMaps'],
        },
      );

    const existingFlatServerlessFunctionMaps =
      flatEntityMaps.flatServerlessFunctionMaps;

    const optimisticallyUpdatedFlatServerlessFunction =
      fromUpdateServerlessFunctionInputToFlatServerlessFunctionToUpdateOrThrow({
        flatServerlessFunctionMaps: existingFlatServerlessFunctionMaps,
        updateServerlessFunctionInput: serverlessFunctionInput,
      });

    const fromFlatServerlessFunctionMaps = getSubFlatEntityMapsOrThrow({
      flatEntityIds: [optimisticallyUpdatedFlatServerlessFunction.id],
      flatEntityMaps: existingFlatServerlessFunctionMaps,
    });
    const toFlatServerlessFunctionMaps =
      replaceFlatEntityInFlatEntityMapsOrThrow({
        flatEntity: optimisticallyUpdatedFlatServerlessFunction,
        flatEntityMaps: fromFlatServerlessFunctionMaps,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          workspaceId,
          fromToAllFlatEntityMaps: {
            flatServerlessFunctionMaps: {
              from: existingFlatServerlessFunctionMaps,
              to: toFlatServerlessFunctionMaps,
            },
          },
          buildOptions: {
            isSystemBuild: false,
            inferDeletionFromMissingEntities: false,
          },
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
      deletedAt: new Date(),
    };

    const toFlatServerlessFunctionMaps =
      replaceFlatEntityInFlatEntityMapsOrThrow({
        flatEntity: optimisticallyUpdatedFlatServerlessFunctionWithDeletedAt,
        flatEntityMaps: existingFlatServerlessFunctionMaps,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          fromToAllFlatEntityMaps: {
            flatServerlessFunctionMaps: {
              from: existingFlatServerlessFunctionMaps,
              to: toFlatServerlessFunctionMaps,
            },
          },
          buildOptions: {
            inferDeletionFromMissingEntities: false,
            isSystemBuild,
          },
          workspaceId,
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

    const fromFlatServerlessFunctionMaps = getSubFlatEntityMapsOrThrow({
      flatEntityIds: [existingFlatServerlessFunction.id],
      flatEntityMaps: existingFlatServerlessFunctionMaps,
    });
    const toFlatServerlessFunctionMaps =
      deleteFlatEntityFromFlatEntityMapsOrThrow({
        flatEntityMaps: fromFlatServerlessFunctionMaps,
        entityToDeleteId: existingFlatServerlessFunction.id,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          fromToAllFlatEntityMaps: {
            flatServerlessFunctionMaps: {
              from: fromFlatServerlessFunctionMaps,
              to: toFlatServerlessFunctionMaps,
            },
          },
          buildOptions: {
            isSystemBuild,
            inferDeletionFromMissingEntities: true,
          },
          workspaceId,
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
