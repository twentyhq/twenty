import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { CreateCronTriggerInput } from 'src/engine/metadata-modules/cron-trigger/dtos/create-cron-trigger.input';
import { CronTriggerIdInput } from 'src/engine/metadata-modules/cron-trigger/dtos/cron-trigger-id.input';
import { UpdateCronTriggerInput } from 'src/engine/metadata-modules/cron-trigger/dtos/update-cron-trigger.input';
import {
  CronTriggerException,
  CronTriggerExceptionCode,
} from 'src/engine/metadata-modules/cron-trigger/exceptions/cron-trigger.exception';
import { FlatCronTrigger } from 'src/engine/metadata-modules/cron-trigger/types/flat-cron-trigger.type';
import { fromCreateCronTriggerInputToFlatCronTrigger } from 'src/engine/metadata-modules/cron-trigger/utils/from-create-cron-trigger-input-to-flat-cron-trigger.util';
import { fromUpdateCronTriggerInputToFlatCronTriggerToUpdateOrThrow } from 'src/engine/metadata-modules/cron-trigger/utils/from-update-cron-trigger-input-to-flat-cron-trigger-to-update-or-throw.util';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { WorkspaceMigrationBuilderExceptionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/exceptions/workspace-migration-builder-exception-v2';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration-v2/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class CronTriggerV2Service {
  constructor(
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly applicationService: ApplicationService,
  ) {}

  async createOne(
    cronTriggerInput: CreateCronTriggerInput,
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

    const flatCronTriggerToCreate = fromCreateCronTriggerInputToFlatCronTrigger(
      {
        createCronTriggerInput: cronTriggerInput,
        workspaceId,
        workspaceCustomApplicationId:
          applicationId ?? workspaceCustomFlatApplication.id,
      },
    );

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            cronTrigger: {
              flatEntityToCreate: [flatCronTriggerToCreate],
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
        'Multiple validation errors occurred while creating cron trigger',
      );
    }

    const { flatCronTriggerMaps: recomputedExistingFlatCronTriggerMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatCronTriggerMaps', 'flatServerlessFunctionMaps'],
        },
      );

    return findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: flatCronTriggerToCreate.id,
      flatEntityMaps: recomputedExistingFlatCronTriggerMaps,
    });
  }

  async updateOne(
    cronTriggerInput: UpdateCronTriggerInput,
    workspaceId: string,
  ) {
    const { flatCronTriggerMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatCronTriggerMaps'],
        },
      );

    const optimisticallyUpdatedFlatCronTrigger =
      fromUpdateCronTriggerInputToFlatCronTriggerToUpdateOrThrow({
        flatCronTriggerMaps,
        updateCronTriggerInput: cronTriggerInput,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            cronTrigger: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: [optimisticallyUpdatedFlatCronTrigger],
            },
          },
          workspaceId,
          isSystemBuild: false,
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
        validateAndBuildResult,
        'Multiple validation errors occurred while updating cron trigger',
      );
    }

    const { flatCronTriggerMaps: recomputedExistingFlatCronTriggerMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatCronTriggerMaps'],
        },
      );

    return findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: optimisticallyUpdatedFlatCronTrigger.id,
      flatEntityMaps: recomputedExistingFlatCronTriggerMaps,
    });
  }

  async destroyOne({
    destroyCronTriggerInput,
    workspaceId,
  }: {
    destroyCronTriggerInput: CronTriggerIdInput;
    workspaceId: string;
  }): Promise<FlatCronTrigger> {
    const { flatCronTriggerMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatCronTriggerMaps'],
        },
      );

    const existingFlatCronTrigger =
      flatCronTriggerMaps.byId[destroyCronTriggerInput.id];

    if (!isDefined(existingFlatCronTrigger)) {
      throw new CronTriggerException(
        'Cron trigger to destroy not found',
        CronTriggerExceptionCode.CRON_TRIGGER_NOT_FOUND,
      );
    }

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            cronTrigger: {
              flatEntityToCreate: [],
              flatEntityToDelete: [existingFlatCronTrigger],
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
        'Multiple validation errors occurred while destroying cron trigger',
      );
    }

    return existingFlatCronTrigger;
  }
}
