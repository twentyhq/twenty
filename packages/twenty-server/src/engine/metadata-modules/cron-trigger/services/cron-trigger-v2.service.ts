import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/core-modules/common/services/workspace-many-or-all-flat-entity-maps-cache.service.';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { deleteFlatEntityFromFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/delete-flat-entity-from-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { getSubFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/get-sub-flat-entity-maps-or-throw.util';
import { replaceFlatEntityInFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/replace-flat-entity-in-flat-entity-maps-or-throw.util';
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
import { WorkspaceMigrationBuilderExceptionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/exceptions/workspace-migration-builder-exception-v2';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration-v2/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class CronTriggerV2Service {
  constructor(
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {}

  async createOne(
    cronTriggerInput: CreateCronTriggerInput,
    workspaceId: string,
  ) {
    const flatEntityMaps =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatEntities: ['flatCronTriggerMaps'],
        },
      );

    const existingFlatCronTriggerMaps = flatEntityMaps.flatCronTriggerMaps;

    const flatCronTriggerToCreate = fromCreateCronTriggerInputToFlatCronTrigger(
      {
        createCronTriggerInput: cronTriggerInput,
        workspaceId,
      },
    );

    const toFlatCronTriggerMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: flatCronTriggerToCreate,
      flatEntityMaps: existingFlatCronTriggerMaps,
    });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          workspaceId,
          fromToAllFlatEntityMaps: {
            flatCronTriggerMaps: {
              from: existingFlatCronTriggerMaps,
              to: toFlatCronTriggerMaps,
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
        'Multiple validation errors occurred while creating cron trigger',
      );
    }

    const { flatCronTriggerMaps: recomputedExistingFlatCronTriggerMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatEntities: ['flatCronTriggerMaps'],
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
    const flatEntityMaps =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatEntities: ['flatCronTriggerMaps'],
        },
      );

    const existingFlatCronTriggerMaps = flatEntityMaps.flatCronTriggerMaps;

    const optimisticallyUpdatedFlatCronTrigger =
      fromUpdateCronTriggerInputToFlatCronTriggerToUpdateOrThrow({
        flatCronTriggerMaps: existingFlatCronTriggerMaps,
        updateCronTriggerInput: cronTriggerInput,
      });

    const fromFlatCronTriggerMaps = getSubFlatEntityMapsOrThrow({
      flatEntityIds: [optimisticallyUpdatedFlatCronTrigger.id],
      flatEntityMaps: existingFlatCronTriggerMaps,
    });
    const toFlatCronTriggerMaps = replaceFlatEntityInFlatEntityMapsOrThrow({
      flatEntity: optimisticallyUpdatedFlatCronTrigger,
      flatEntityMaps: fromFlatCronTriggerMaps,
    });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          workspaceId,
          fromToAllFlatEntityMaps: {
            flatCronTriggerMaps: {
              from: existingFlatCronTriggerMaps,
              to: toFlatCronTriggerMaps,
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
        'Multiple validation errors occurred while updating cron trigger',
      );
    }

    const { flatCronTriggerMaps: recomputedExistingFlatCronTriggerMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatEntities: ['flatCronTriggerMaps'],
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
    const { flatCronTriggerMaps: existingFlatCronTriggerMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatEntities: ['flatCronTriggerMaps'],
        },
      );

    const existingFlatCronTrigger =
      existingFlatCronTriggerMaps.byId[destroyCronTriggerInput.id];

    if (!isDefined(existingFlatCronTrigger)) {
      throw new CronTriggerException(
        'Cron trigger to destroy not found',
        CronTriggerExceptionCode.CRON_TRIGGER_NOT_FOUND,
      );
    }

    const fromFlatCronTriggerMaps = getSubFlatEntityMapsOrThrow({
      flatEntityIds: [existingFlatCronTrigger.id],
      flatEntityMaps: existingFlatCronTriggerMaps,
    });
    const toFlatCronTriggerMaps = deleteFlatEntityFromFlatEntityMapsOrThrow({
      flatEntityMaps: fromFlatCronTriggerMaps,
      entityToDeleteId: existingFlatCronTrigger.id,
    });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          fromToAllFlatEntityMaps: {
            flatCronTriggerMaps: {
              from: fromFlatCronTriggerMaps,
              to: toFlatCronTriggerMaps,
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
        'Multiple validation errors occurred while destroying cron trigger',
      );
    }

    return existingFlatCronTrigger;
  }
}
