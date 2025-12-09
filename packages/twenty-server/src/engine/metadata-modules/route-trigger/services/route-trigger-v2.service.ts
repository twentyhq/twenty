import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
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
          allFlatEntityOperationByMetadataName: {
            routeTrigger: {
              flatEntityToCreate: [flatRouteTriggerToCreate],
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
    const { flatRouteTriggerMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatRouteTriggerMaps'],
        },
      );

    const optimisticallyUpdatedFlatRouteTrigger =
      fromUpdateRouteTriggerInputToFlatRouteTriggerToUpdateOrThrow({
        flatRouteTriggerMaps,
        updateRouteTriggerInput: routeTriggerInput,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            routeTrigger: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [optimisticallyUpdatedFlatRouteTrigger],
            },
          },
          workspaceId,
          isSystemBuild: false,
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
    const { flatRouteTriggerMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatRouteTriggerMaps'],
        },
      );

    const existingFlatRoute =
      flatRouteTriggerMaps.byId[destroyRouteTriggerInput.id];

    if (!isDefined(existingFlatRoute)) {
      throw new RouteTriggerException(
        'Route to destroy not found',
        RouteTriggerExceptionCode.ROUTE_NOT_FOUND,
      );
    }

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            routeTrigger: {
              flatEntityToCreate: [],
              flatEntityToDelete: [existingFlatRoute],
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
        'Multiple validation errors occurred while destroying route',
      );
    }

    return existingFlatRoute;
  }
}
