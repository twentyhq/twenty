import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { DatabaseEventTriggerExceptionCode } from 'src/engine/metadata-modules/database-event-trigger/exceptions/database-event-trigger.exception';
import { FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/utils/get-flat-entity-validation-error.util';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-update-validation-args.type';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';
import { fromFlatEntityPropertiesUpdatesToPartialFlatEntity } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/from-flat-entity-properties-updates-to-partial-flat-entity';

// TODO: validate settings integrity
@Injectable()
export class FlatDatabaseEventTriggerValidatorService {
  constructor() {}

  public validateFlatDatabaseEventTriggerUpdate({
    flatEntityId,
    flatEntityUpdates,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatDatabaseEventTriggerMaps: optimisticFlatDatabaseEventTriggerMaps,
      flatServerlessFunctionMaps,
    },
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.databaseEventTrigger
  >): FailedFlatEntityValidation<'databaseEventTrigger', 'update'> {
    const existingFlatDatabaseEventTrigger =
      optimisticFlatDatabaseEventTriggerMaps.byId[flatEntityId];

    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: flatEntityId,
        universalIdentifier:
          existingFlatDatabaseEventTrigger?.universalIdentifier,
      },
      metadataName: 'databaseEventTrigger',
      type: 'update',
    });

    if (!isDefined(existingFlatDatabaseEventTrigger)) {
      validationResult.errors.push({
        code: DatabaseEventTriggerExceptionCode.DATABASE_EVENT_TRIGGER_NOT_FOUND,
        message: t`Database event trigger not found`,
        userFriendlyMessage: msg`Database event trigger not found`,
      });

      return validationResult;
    }

    const updatedFlatDatabaseEventTrigger = {
      ...existingFlatDatabaseEventTrigger,
      ...fromFlatEntityPropertiesUpdatesToPartialFlatEntity({
        updates: flatEntityUpdates,
      }),
    };

    const serverlessFunction =
      flatServerlessFunctionMaps.byId[
        updatedFlatDatabaseEventTrigger.serverlessFunctionId
      ];

    if (!isDefined(serverlessFunction)) {
      validationResult.errors.push({
        code: DatabaseEventTriggerExceptionCode.SERVERLESS_FUNCTION_NOT_FOUND,
        message: t`Serverless function not found`,
        userFriendlyMessage: msg`Serverless function not found`,
      });
    }

    return validationResult;
  }

  public validateFlatDatabaseEventTriggerDeletion({
    flatEntityToValidate: {
      id: databaseEventTriggerIdToDelete,
      universalIdentifier,
    },
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatDatabaseEventTriggerMaps: optimisticFlatDatabaseEventTriggerMaps,
    },
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.databaseEventTrigger
  >): FailedFlatEntityValidation<'databaseEventTrigger', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: databaseEventTriggerIdToDelete,
        universalIdentifier,
      },
      metadataName: 'databaseEventTrigger',
      type: 'delete',
    });

    const existingFlatDatabaseEventTrigger =
      optimisticFlatDatabaseEventTriggerMaps.byId[
        databaseEventTriggerIdToDelete
      ];

    if (!isDefined(existingFlatDatabaseEventTrigger)) {
      validationResult.errors.push({
        code: DatabaseEventTriggerExceptionCode.DATABASE_EVENT_TRIGGER_NOT_FOUND,
        message: t`Database event trigger not found`,
        userFriendlyMessage: msg`Database event trigger not found`,
      });
    }

    return validationResult;
  }

  public validateFlatDatabaseEventTriggerCreation({
    flatEntityToValidate: flatDatabaseEventTriggerToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatDatabaseEventTriggerMaps: optimisticFlatDatabaseEventTriggerMaps,
      flatServerlessFunctionMaps,
    },
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.databaseEventTrigger
  >): FailedFlatEntityValidation<'databaseEventTrigger', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        id: flatDatabaseEventTriggerToValidate.id,
        universalIdentifier:
          flatDatabaseEventTriggerToValidate.universalIdentifier,
      },
      metadataName: 'databaseEventTrigger',
      type: 'create',
    });

    if (
      isDefined(
        optimisticFlatDatabaseEventTriggerMaps.byId[
          flatDatabaseEventTriggerToValidate.id
        ],
      )
    ) {
      validationResult.errors.push({
        code: DatabaseEventTriggerExceptionCode.DATABASE_EVENT_TRIGGER_ALREADY_EXIST,
        message: t`Database event trigger with same id already exists`,
        userFriendlyMessage: msg`Database event trigger already exists`,
      });
    }

    const serverlessFunction =
      flatServerlessFunctionMaps?.byId?.[
        flatDatabaseEventTriggerToValidate.serverlessFunctionId
      ];

    if (!isDefined(serverlessFunction)) {
      validationResult.errors.push({
        code: DatabaseEventTriggerExceptionCode.SERVERLESS_FUNCTION_NOT_FOUND,
        message: t`Serverless function not found`,
        userFriendlyMessage: msg`Serverless function not found`,
      });
    }

    return validationResult;
  }
}
