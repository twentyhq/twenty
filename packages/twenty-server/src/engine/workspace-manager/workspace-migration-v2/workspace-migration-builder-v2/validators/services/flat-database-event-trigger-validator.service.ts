import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { DatabaseEventTriggerExceptionCode } from 'src/engine/metadata-modules/database-event-trigger/exceptions/database-event-trigger.exception';
import { FlatDatabaseEventTrigger } from 'src/engine/metadata-modules/database-event-trigger/types/flat-database-event-trigger.type';
import { FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';
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
  >): FailedFlatEntityValidation<FlatDatabaseEventTrigger> {
    const validationResult: FailedFlatEntityValidation<FlatDatabaseEventTrigger> =
      {
        type: 'update_database_event_trigger',
        errors: [],
        flatEntityMinimalInformation: {
          id: flatEntityId,
        },
      };

    const existingFlatDatabaseEventTrigger =
      optimisticFlatDatabaseEventTriggerMaps.byId[flatEntityId];

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
    flatEntityToValidate: { id: databaseEventTriggerIdToDelete },
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatDatabaseEventTriggerMaps: optimisticFlatDatabaseEventTriggerMaps,
    },
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.databaseEventTrigger
  >): FailedFlatEntityValidation<FlatDatabaseEventTrigger> {
    const validationResult: FailedFlatEntityValidation<FlatDatabaseEventTrigger> =
      {
        type: 'delete_database_event_trigger',
        errors: [],
        flatEntityMinimalInformation: {
          id: databaseEventTriggerIdToDelete,
        },
      };

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

  public async validateFlatDatabaseEventTriggerCreation({
    flatEntityToValidate: flatDatabaseEventTriggerToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatDatabaseEventTriggerMaps: optimisticFlatDatabaseEventTriggerMaps,
      flatServerlessFunctionMaps,
    },
  }: FlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.databaseEventTrigger
  >): Promise<FailedFlatEntityValidation<FlatDatabaseEventTrigger>> {
    const validationResult: FailedFlatEntityValidation<FlatDatabaseEventTrigger> =
      {
        type: 'create_database_event_trigger',
        errors: [],
        flatEntityMinimalInformation: {
          id: flatDatabaseEventTriggerToValidate.id,
        },
      };

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
