import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/core-modules/common/services/workspace-many-or-all-flat-entity-maps-cache.service.';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { deleteFlatEntityFromFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/delete-flat-entity-from-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { getSubFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/get-sub-flat-entity-maps-or-throw.util';
import { replaceFlatEntityInFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/replace-flat-entity-in-flat-entity-maps-or-throw.util';
import { CreateRouteInput } from 'src/engine/metadata-modules/route/dtos/create-route.input';
import { RouteIdInput } from 'src/engine/metadata-modules/route/dtos/route-id.input';
import { UpdateRouteInput } from 'src/engine/metadata-modules/route/dtos/update-route.input';
import {
  RouteException,
  RouteExceptionCode,
} from 'src/engine/metadata-modules/route/exceptions/route.exception';
import { FlatRoute } from 'src/engine/metadata-modules/route/types/flat-route.type';
import { fromCreateRouteInputToFlatRoute } from 'src/engine/metadata-modules/route/utils/from-create-route-input-to-flat-route.util';
import { fromUpdateRouteInputToFlatRouteToUpdateOrThrow } from 'src/engine/metadata-modules/route/utils/from-update-route-input-to-flat-route-to-update-or-throw.util';
import { WorkspaceMigrationBuilderExceptionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/exceptions/workspace-migration-builder-exception-v2';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration-v2/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class RouteV2Service {
  constructor(
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {}

  async createOne(routeInput: CreateRouteInput, workspaceId: string) {
    const flatEntityMaps =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatEntities: ['flatRouteMaps'],
        },
      );

    const existingFlatRouteMaps = flatEntityMaps.flatRouteMaps;

    const flatRouteToCreate = fromCreateRouteInputToFlatRoute({
      createRouteInput: routeInput,
      workspaceId,
    });

    const toFlatRouteMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: flatRouteToCreate,
      flatEntityMaps: existingFlatRouteMaps,
    });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          workspaceId,
          fromToAllFlatEntityMaps: {
            flatRouteMaps: {
              from: existingFlatRouteMaps,
              to: toFlatRouteMaps,
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
        'Multiple validation errors occurred while creating route',
      );
    }

    const { flatRouteMaps: recomputedExistingFlatRouteMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatEntities: ['flatRouteMaps'],
        },
      );

    return findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: flatRouteToCreate.id,
      flatEntityMaps: recomputedExistingFlatRouteMaps,
    });
  }

  async updateOne(routeInput: UpdateRouteInput, workspaceId: string) {
    const flatEntityMaps =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatEntities: ['flatRouteMaps'],
        },
      );

    const existingFlatRouteMaps = flatEntityMaps.flatRouteMaps;

    const optimisticallyUpdatedFlatRoute =
      fromUpdateRouteInputToFlatRouteToUpdateOrThrow({
        flatRouteMaps: existingFlatRouteMaps,
        updateRouteInput: routeInput,
      });

    const fromFlatRouteMaps = getSubFlatEntityMapsOrThrow({
      flatEntityIds: [optimisticallyUpdatedFlatRoute.id],
      flatEntityMaps: existingFlatRouteMaps,
    });
    const toFlatRouteMaps = replaceFlatEntityInFlatEntityMapsOrThrow({
      flatEntity: optimisticallyUpdatedFlatRoute,
      flatEntityMaps: fromFlatRouteMaps,
    });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          workspaceId,
          fromToAllFlatEntityMaps: {
            flatRouteMaps: {
              from: existingFlatRouteMaps,
              to: toFlatRouteMaps,
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
        'Multiple validation errors occurred while updating route',
      );
    }

    const { flatRouteMaps: recomputedExistingFlatRouteMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatEntities: ['flatRouteMaps'],
        },
      );

    return findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: optimisticallyUpdatedFlatRoute.id,
      flatEntityMaps: recomputedExistingFlatRouteMaps,
    });
  }

  async destroyOne({
    destroyRouteInput,
    workspaceId,
  }: {
    destroyRouteInput: RouteIdInput;
    workspaceId: string;
  }): Promise<FlatRoute> {
    const { flatRouteMaps: existingFlatRouteMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatEntities: ['flatRouteMaps'],
        },
      );

    const existingFlatRoute = existingFlatRouteMaps.byId[destroyRouteInput.id];

    if (!isDefined(existingFlatRoute)) {
      throw new RouteException(
        'Route to destroy not found',
        RouteExceptionCode.ROUTE_NOT_FOUND,
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
            flatRouteMaps: {
              from: fromFlatRouteMaps,
              to: toFlatRouteMaps,
            },
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
