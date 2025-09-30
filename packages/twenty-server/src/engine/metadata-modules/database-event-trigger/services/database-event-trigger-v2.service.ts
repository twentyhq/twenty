import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/core-modules/common/services/workspace-many-or-all-flat-entity-maps-cache.service.';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { deleteFlatEntityFromFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/delete-flat-entity-from-flat-entity-maps-or-throw.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { getSubFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/get-sub-flat-entity-maps-or-throw.util';
import { replaceFlatEntityInFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/replace-flat-entity-in-flat-entity-maps-or-throw.util';
import { CreateDatabaseEventTriggerInput } from 'src/engine/metadata-modules/database-event-trigger/dtos/create-database-event-trigger.input';
import { DatabaseEventTriggerIdInput } from 'src/engine/metadata-modules/database-event-trigger/dtos/database-event-trigger-id.input';
import { UpdateDatabaseEventTriggerInput } from 'src/engine/metadata-modules/database-event-trigger/dtos/update-database-event-trigger.input';
import {
  DatabaseEventTriggerException,
  DatabaseEventTriggerExceptionCode,
} from 'src/engine/metadata-modules/database-event-trigger/exceptions/database-event-trigger.exception';
import { FlatDatabaseEventTrigger } from 'src/engine/metadata-modules/database-event-trigger/types/flat-database-event-trigger.type';
import { fromCreateDatabaseEventTriggerInputToFlatDatabaseEventTrigger } from 'src/engine/metadata-modules/database-event-trigger/utils/from-create-database-event-trigger-input-to-flat-database-event-trigger.util';
import { fromUpdateDatabaseEventTriggerInputToFlatDatabaseEventTriggerToUpdateOrThrow } from 'src/engine/metadata-modules/database-event-trigger/utils/from-update-database-event-trigger-input-to-flat-database-event-trigger-to-update-or-throw.util';
import { WorkspaceMigrationBuilderExceptionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/exceptions/workspace-migration-builder-exception-v2';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration-v2/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class DatabaseEventTriggerV2Service {
  constructor(
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {}

  async createOne(
    databaseEventTriggerInput: CreateDatabaseEventTriggerInput,
    workspaceId: string,
  ) {
    const flatEntityMaps =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatEntities: ['flatDatabaseEventTriggerMaps'],
        },
      );

    const existingFlatDatabaseEventTriggerMaps =
      flatEntityMaps.flatDatabaseEventTriggerMaps;

    const flatDatabaseEventTriggerToCreate =
      fromCreateDatabaseEventTriggerInputToFlatDatabaseEventTrigger({
        createDatabaseEventTriggerInput: databaseEventTriggerInput,
        workspaceId,
      });

    const toFlatDatabaseEventTriggerMaps = addFlatEntityToFlatEntityMapsOrThrow(
      {
        flatEntity: flatDatabaseEventTriggerToCreate,
        flatEntityMaps: existingFlatDatabaseEventTriggerMaps,
      },
    );

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          workspaceId,
          fromToAllFlatEntityMaps: {
            flatDatabaseEventTriggerMaps: {
              from: existingFlatDatabaseEventTriggerMaps,
              to: toFlatDatabaseEventTriggerMaps,
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
        'Multiple validation errors occurred while creating database event trigger',
      );
    }

    const {
      flatDatabaseEventTriggerMaps:
        recomputedExistingFlatDatabaseEventTriggerMaps,
    } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatEntities: ['flatDatabaseEventTriggerMaps'],
        },
      );

    return findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: flatDatabaseEventTriggerToCreate.id,
      flatEntityMaps: recomputedExistingFlatDatabaseEventTriggerMaps,
    });
  }

  async updateOne(
    databaseEventTriggerInput: UpdateDatabaseEventTriggerInput,
    workspaceId: string,
  ) {
    const flatEntityMaps =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatEntities: ['flatDatabaseEventTriggerMaps'],
        },
      );

    const existingFlatDatabaseEventTriggerMaps =
      flatEntityMaps.flatDatabaseEventTriggerMaps;

    const optimisticallyUpdatedFlatDatabaseEventTrigger =
      fromUpdateDatabaseEventTriggerInputToFlatDatabaseEventTriggerToUpdateOrThrow(
        {
          flatDatabaseEventTriggerMaps: existingFlatDatabaseEventTriggerMaps,
          updateDatabaseEventTriggerInput: databaseEventTriggerInput,
        },
      );

    const fromFlatDatabaseEventTriggerMaps = getSubFlatEntityMapsOrThrow({
      flatEntityIds: [optimisticallyUpdatedFlatDatabaseEventTrigger.id],
      flatEntityMaps: existingFlatDatabaseEventTriggerMaps,
    });
    const toFlatDatabaseEventTriggerMaps =
      replaceFlatEntityInFlatEntityMapsOrThrow({
        flatEntity: optimisticallyUpdatedFlatDatabaseEventTrigger,
        flatEntityMaps: fromFlatDatabaseEventTriggerMaps,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          workspaceId,
          fromToAllFlatEntityMaps: {
            flatDatabaseEventTriggerMaps: {
              from: existingFlatDatabaseEventTriggerMaps,
              to: toFlatDatabaseEventTriggerMaps,
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
        'Multiple validation errors occurred while updating database event trigger',
      );
    }

    const {
      flatDatabaseEventTriggerMaps:
        recomputedExistingFlatDatabaseEventTriggerMaps,
    } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatEntities: ['flatDatabaseEventTriggerMaps'],
        },
      );

    return findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: optimisticallyUpdatedFlatDatabaseEventTrigger.id,
      flatEntityMaps: recomputedExistingFlatDatabaseEventTriggerMaps,
    });
  }

  async destroyOne({
    destroyDatabaseEventTriggerInput,
    workspaceId,
  }: {
    destroyDatabaseEventTriggerInput: DatabaseEventTriggerIdInput;
    workspaceId: string;
  }): Promise<FlatDatabaseEventTrigger> {
    const {
      flatDatabaseEventTriggerMaps: existingFlatDatabaseEventTriggerMaps,
    } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatEntities: ['flatDatabaseEventTriggerMaps'],
        },
      );

    const existingFlatDatabaseEventTrigger =
      existingFlatDatabaseEventTriggerMaps.byId[
        destroyDatabaseEventTriggerInput.id
      ];

    if (!isDefined(existingFlatDatabaseEventTrigger)) {
      throw new DatabaseEventTriggerException(
        'Database event trigger to destroy not found',
        DatabaseEventTriggerExceptionCode.DATABASE_EVENT_TRIGGER_NOT_FOUND,
      );
    }

    const fromFlatDatabaseEventTriggerMaps = getSubFlatEntityMapsOrThrow({
      flatEntityIds: [existingFlatDatabaseEventTrigger.id],
      flatEntityMaps: existingFlatDatabaseEventTriggerMaps,
    });
    const toFlatDatabaseEventTriggerMaps =
      deleteFlatEntityFromFlatEntityMapsOrThrow({
        flatEntityMaps: fromFlatDatabaseEventTriggerMaps,
        entityToDeleteId: existingFlatDatabaseEventTrigger.id,
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          fromToAllFlatEntityMaps: {
            flatDatabaseEventTriggerMaps: {
              from: fromFlatDatabaseEventTriggerMaps,
              to: toFlatDatabaseEventTriggerMaps,
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
        'Multiple validation errors occurred while destroying database event trigger',
      );
    }

    return existingFlatDatabaseEventTrigger;
  }
}
