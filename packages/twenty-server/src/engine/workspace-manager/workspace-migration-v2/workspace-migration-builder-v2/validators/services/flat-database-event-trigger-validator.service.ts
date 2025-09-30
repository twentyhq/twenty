import { Injectable } from '@nestjs/common';

import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';
import { FlatEntityMaps } from 'src/engine/core-modules/common/types/flat-entity-maps.type';
import { DatabaseEventTriggerExceptionCode } from 'src/engine/metadata-modules/database-event-trigger/exceptions/database-event-trigger.exception';
import { FlatDatabaseEventTrigger } from 'src/engine/metadata-modules/database-event-trigger/types/flat-database-event-trigger.type';
import { FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';

export type DatabaseEventTriggerRelatedFlatEntityMaps = Pick<
  AllFlatEntityMaps,
  'flatDatabaseEventTriggerMaps'
>;

type DatabaseEventTriggerValidationArgs = {
  flatDatabaseEventTriggerToValidate: FlatDatabaseEventTrigger;
  optimisticFlatDatabaseEventTriggerMaps: FlatEntityMaps<FlatDatabaseEventTrigger>;
  dependencyOptimisticFlatEntityMaps: DatabaseEventTriggerRelatedFlatEntityMaps;
};
// TODO: validate settings integrity
@Injectable()
export class FlatDatabaseEventTriggerValidatorService {
  constructor() {}

  public validateFlatDatabaseEventTriggerUpdate({
    flatDatabaseEventTriggerToValidate: updatedFlatDatabaseEventTrigger,
    optimisticFlatDatabaseEventTriggerMaps,
  }: DatabaseEventTriggerValidationArgs): FailedFlatEntityValidation<FlatDatabaseEventTrigger> {
    const errors = [];

    const existingFlatDatabaseEventTrigger =
      optimisticFlatDatabaseEventTriggerMaps.byId[
        updatedFlatDatabaseEventTrigger.id
      ];

    if (!isDefined(existingFlatDatabaseEventTrigger)) {
      errors.push({
        code: DatabaseEventTriggerExceptionCode.DATABASE_EVENT_TRIGGER_NOT_FOUND,
        message: t`Database event trigger not found`,
        userFriendlyMessage: t`Database event trigger not found`,
      });
    }

    return {
      type: 'update_database_event_trigger',
      errors,
      flatEntityMinimalInformation: {
        id: updatedFlatDatabaseEventTrigger.id,
      },
    };
  }

  public validateFlatDatabaseEventTriggerDeletion({
    flatDatabaseEventTriggerToValidate: { id: databaseEventTriggerIdToDelete },
    optimisticFlatDatabaseEventTriggerMaps,
  }: DatabaseEventTriggerValidationArgs): FailedFlatEntityValidation<FlatDatabaseEventTrigger> {
    const errors = [];

    const existingFlatDatabaseEventTrigger =
      optimisticFlatDatabaseEventTriggerMaps.byId[
        databaseEventTriggerIdToDelete
      ];

    if (!isDefined(existingFlatDatabaseEventTrigger)) {
      errors.push({
        code: DatabaseEventTriggerExceptionCode.DATABASE_EVENT_TRIGGER_NOT_FOUND,
        message: t`Database event trigger not found`,
        userFriendlyMessage: t`Database event trigger not found`,
      });
    }

    return {
      type: 'delete_database_event_trigger',
      errors,
      flatEntityMinimalInformation: {
        id: databaseEventTriggerIdToDelete,
      },
    };
  }

  public async validateFlatDatabaseEventTriggerCreation({
    flatDatabaseEventTriggerToValidate,
    optimisticFlatDatabaseEventTriggerMaps,
  }: DatabaseEventTriggerValidationArgs): Promise<
    FailedFlatEntityValidation<FlatDatabaseEventTrigger>
  > {
    const errors = [];

    if (
      isDefined(
        optimisticFlatDatabaseEventTriggerMaps.byId[
          flatDatabaseEventTriggerToValidate.id
        ],
      )
    ) {
      errors.push({
        code: DatabaseEventTriggerExceptionCode.DATABASE_EVENT_TRIGGER_ALREADY_EXIST,
        message: t`Database event trigger with same id already exists`,
        userFriendlyMessage: t`Database event trigger already exists`,
      });
    }

    return {
      type: 'create_database_event_trigger',
      errors,
      flatEntityMinimalInformation: {
        id: flatDatabaseEventTriggerToValidate.id,
      },
    };
  }
}
