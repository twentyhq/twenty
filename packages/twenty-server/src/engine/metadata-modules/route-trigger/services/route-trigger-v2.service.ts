import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { computeFlatEntityMapsFromTo } from 'src/engine/metadata-modules/flat-entity/utils/compute-flat-entity-maps-from-to.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
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
    private readonly applicationService: ApplicationService,
  ) {}

  async createOne(
    routeTriggerInput: CreateRouteTriggerInput,
    workspaceId: string,
    /**
     * @deprecated do not use call validateBuildAndRunWorkspaceMigration contextually
     * when interacting with another application than workspace custom one
     * */
    applicationId?: string,
  ) {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );

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
        workspaceCustomApplicationId:
          applicationId ?? workspaceCustomFlatApplication.id,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          workspaceId,
          fromToAllFlatEntityMaps: {
            flatRouteTriggerMaps: computeFlatEntityMapsFromTo({
              flatEntityMaps: existingFlatRouteMaps,
              flatEntityToCreate: [flatRouteTriggerToCreate],
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            }),
          },
          dependencyAllFlatEntityMaps: {
            flatServerlessFunctionMaps:
              flatEntityMaps.flatServerlessFunctionMaps,
          },
          buildOptions: {
            isSystemBuild: false,
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

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          workspaceId,
          fromToAllFlatEntityMaps: {
            flatRouteTriggerMaps: computeFlatEntityMapsFromTo({
              flatEntityMaps: existingFlatRouteMaps,
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [optimisticallyUpdatedFlatRouteTrigger],
            }),
          },
          dependencyAllFlatEntityMaps: {
            flatServerlessFunctionMaps:
              flatEntityMaps.flatServerlessFunctionMaps,
          },
          buildOptions: {
            isSystemBuild: false,
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

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          fromToAllFlatEntityMaps: {
            flatRouteTriggerMaps: computeFlatEntityMapsFromTo({
              flatEntityMaps: existingFlatRouteMaps,
              flatEntityToCreate: [],
              flatEntityToDelete: [existingFlatRoute],
              flatEntityToUpdate: [],
            }),
          },
          dependencyAllFlatEntityMaps: {
            flatServerlessFunctionMaps: existingFlatServerlessFunctionMaps,
          },
          buildOptions: {
            isSystemBuild: false,
            inferDeletionFromMissingEntities: {
              routeTrigger: true,
            },
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
