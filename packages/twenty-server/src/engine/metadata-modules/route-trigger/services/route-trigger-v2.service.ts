import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/core-modules/common/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { deleteFlatEntityFromFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/delete-flat-entity-from-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { getSubFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/get-sub-flat-entity-maps-or-throw.util';
import { replaceFlatEntityInFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/replace-flat-entity-in-flat-entity-maps-or-throw.util';
import { CreateRouteTriggerInput } from 'src/engine/metadata-modules/route-trigger/dtos/create-route-trigger.input';
import { RouteTriggerIdInput } from 'src/engine/metadata-modules/route-trigger/dtos/route-trigger-id.input';
import { UpdateRouteTriggerInput } from 'src/engine/metadata-modules/route-trigger/dtos/update-route-trigger.input';
import {
  RouteTriggerException,
  RouteTriggerExceptionCode,
} from 'src/engine/metadata-modules/route-trigger/exceptions/route-trigger.exception';
import { FlatRouteTrigger } from 'src/engine/metadata-modules/route-trigger/types/flat-route-trigger.type';
import { fromCreateRouteTriggerInputToFlatRouteTrigger } from 'src/engine/metadata-modules/route-trigger/utils/from-create-route-trigger-input-to-flat-route-trigger.util';
import { fromUpdateRouteTriggerInputToFlatRouteTriggerToUpdateOrThrow } from 'src/engine/metadata-modules/route-trigger/utils/from-update-route-trigger-input-to-flat-route-trigger-to-update-or-throw.util';
import { WorkspaceMigrationBuilderExceptionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/exceptions/workspace-migration-builder-exception-v2';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration-v2/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class RouteTriggerV2Service {
  constructor(
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {}

  async createOne(
    routeTriggerInput: CreateRouteTriggerInput,
    workspaceId: string,
  ) {
    const flatEntityMaps =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatRouteTriggerMaps', 'flatServerlessFunctionMaps'],
        },
      );

    const existingFlatRouteMaps = flatEntityMaps.flatRouteTriggerMaps;

    const flatRouteTriggerToCreate =
      fromCreateRouteTriggerInputToFlatRouteTrigger({
        createRouteTriggerInput: routeTriggerInput,
        workspaceId,
      });

    const toFlatRouteMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: flatRouteTriggerToCreate,
      flatEntityMaps: existingFlatRouteMaps,
    });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          workspaceId,
          fromToAllFlatEntityMaps: {
            flatRouteTriggerMaps: {
              from: existingFlatRouteMaps,
              to: toFlatRouteMaps,
            },
          },
          dependencyAllFlatEntityMaps: {
            flatServerlessFunctionMaps:
              flatEntityMaps.flatServerlessFunctionMaps,
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
        'Multiple validation errors occurred while creating route',
      );
    }

    const { flatRouteTriggerMaps: recomputedExistingFlatRouteMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatRouteTriggerMaps'],
        },
      );

    return findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: flatRouteTriggerToCreate.id,
      flatEntityMaps: recomputedExistingFlatRouteMaps,
    });
  }

  async updateOne(
    routeTriggerInput: UpdateRouteTriggerInput,
    workspaceId: string,
  ) {
    const flatEntityMaps =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatRouteTriggerMaps', 'flatServerlessFunctionMaps'],
        },
      );

    const existingFlatRouteMaps = flatEntityMaps.flatRouteTriggerMaps;

    const optimisticallyUpdatedFlatRouteTrigger =
      fromUpdateRouteTriggerInputToFlatRouteTriggerToUpdateOrThrow({
        flatRouteTriggerMaps: existingFlatRouteMaps,
        updateRouteTriggerInput: routeTriggerInput,
      });

    const fromFlatRouteMaps = getSubFlatEntityMapsOrThrow({
      flatEntityIds: [optimisticallyUpdatedFlatRouteTrigger.id],
      flatEntityMaps: existingFlatRouteMaps,
    });
    const toFlatRouteMaps = replaceFlatEntityInFlatEntityMapsOrThrow({
      flatEntity: optimisticallyUpdatedFlatRouteTrigger,
      flatEntityMaps: fromFlatRouteMaps,
    });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          workspaceId,
          fromToAllFlatEntityMaps: {
            flatRouteTriggerMaps: {
              from: existingFlatRouteMaps,
              to: toFlatRouteMaps,
            },
          },
          dependencyAllFlatEntityMaps: {
            flatServerlessFunctionMaps:
              flatEntityMaps.flatServerlessFunctionMaps,
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
        'Multiple validation errors occurred while updating route',
      );
    }

    const { flatRouteTriggerMaps: recomputedExistingFlatRouteMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatRouteTriggerMaps'],
        },
      );

    return findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: optimisticallyUpdatedFlatRouteTrigger.id,
      flatEntityMaps: recomputedExistingFlatRouteMaps,
    });
  }

  async destroyOne({
    destroyRouteTriggerInput,
    workspaceId,
  }: {
    destroyRouteTriggerInput: RouteTriggerIdInput;
    workspaceId: string;
  }): Promise<FlatRouteTrigger> {
    const {
      flatRouteTriggerMaps: existingFlatRouteMaps,
      flatServerlessFunctionMaps: existingFlatServerlessFunctionMaps,
    } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatRouteTriggerMaps', 'flatServerlessFunctionMaps'],
        },
      );

    const existingFlatRoute =
      existingFlatRouteMaps.byId[destroyRouteTriggerInput.id];

    if (!isDefined(existingFlatRoute)) {
      throw new RouteTriggerException(
        'Route to destroy not found',
        RouteTriggerExceptionCode.ROUTE_NOT_FOUND,
      );
    }

    const fromFlatRouteMaps = getSubFlatEntityMapsOrThrow({
      flatEntityIds: [existingFlatRoute.id],
      flatEntityMaps: existingFlatRouteMaps,
    });
    const toFlatRouteMaps = deleteFlatEntityFromFlatEntityMapsOrThrow({
      flatEntityMaps: fromFlatRouteMaps,
      entityToDeleteId: existingFlatRoute.id,
    });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          fromToAllFlatEntityMaps: {
            flatRouteTriggerMaps: {
              from: fromFlatRouteMaps,
              to: toFlatRouteMaps,
            },
          },
          dependencyAllFlatEntityMaps: {
            flatServerlessFunctionMaps: existingFlatServerlessFunctionMaps,
          },
          buildOptions: {
            isSystemBuild: false,
            inferDeletionFromMissingEntities: true,
          },
          workspaceId,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
        validateAndBuildResult,
        'Multiple validation errors occurred while destroying route',
      );
    }

    return existingFlatRoute;
  }
}
