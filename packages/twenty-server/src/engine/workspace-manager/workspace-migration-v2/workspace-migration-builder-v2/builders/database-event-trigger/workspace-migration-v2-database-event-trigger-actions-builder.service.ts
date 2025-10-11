import { Injectable } from '@nestjs/common';

import { AllMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-metadata-name.type';
import { compareTwoFlatDatabaseEventTrigger } from 'src/engine/metadata-modules/database-event-trigger/utils/compare-two-flat-database-event-trigger.util';
import { UpdateDatabaseEventTriggerAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/database-event-trigger/types/workspace-migration-database-event-trigger-action-v2.type';
import { WorkspaceEntityMigrationBuilderV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-entity-migration-builder-v2.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-update-validation-args.type';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';
import { FlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-result.type';
import { FlatDatabaseEventTriggerValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-database-event-trigger-validator.service';

const DATABASE_EVENT_TRIGGER_METADATA_NAME =
  'databaseEventTrigger' as const satisfies AllMetadataName;

@Injectable()
export class WorkspaceMigrationV2DatabaseEventTriggerActionsBuilderService extends WorkspaceEntityMigrationBuilderV2Service<
  typeof DATABASE_EVENT_TRIGGER_METADATA_NAME
> {
  constructor(
    private readonly flatDatabaseEventTriggerValidatorService: FlatDatabaseEventTriggerValidatorService,
  ) {
    super(DATABASE_EVENT_TRIGGER_METADATA_NAME);
  }

  protected async validateFlatEntityCreation({
    flatEntityToValidate: flatDatabaseEventTriggerToValidate,
    optimisticFlatEntityMaps: optimisticFlatDatabaseEventTriggerMaps,
    dependencyOptimisticFlatEntityMaps,
  }: FlatEntityValidationArgs<
    typeof DATABASE_EVENT_TRIGGER_METADATA_NAME
  >): Promise<
    FlatEntityValidationReturnType<
      typeof DATABASE_EVENT_TRIGGER_METADATA_NAME,
      'created'
    >
  > {
    const validationResult =
      await this.flatDatabaseEventTriggerValidatorService.validateFlatDatabaseEventTriggerCreation(
        {
          flatDatabaseEventTriggerToValidate,
          optimisticFlatDatabaseEventTriggerMaps,
          dependencyOptimisticFlatEntityMaps,
        },
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    return {
      status: 'success',
      action: {
        type: 'create_database_event_trigger',
        databaseEventTrigger: flatDatabaseEventTriggerToValidate,
      },
      dependencyOptimisticFlatEntityMaps,
    };
  }

  protected async validateFlatEntityDeletion({
    flatEntityToValidate: flatDatabaseEventTriggerToValidate,
    optimisticFlatEntityMaps: optimisticFlatDatabaseEventTriggerMaps,
    dependencyOptimisticFlatEntityMaps,
  }: FlatEntityValidationArgs<
    typeof DATABASE_EVENT_TRIGGER_METADATA_NAME
  >): Promise<
    FlatEntityValidationReturnType<
      typeof DATABASE_EVENT_TRIGGER_METADATA_NAME,
      'deleted'
    >
  > {
    const validationResult =
      this.flatDatabaseEventTriggerValidatorService.validateFlatDatabaseEventTriggerDeletion(
        {
          flatDatabaseEventTriggerToValidate,
          optimisticFlatDatabaseEventTriggerMaps,
          dependencyOptimisticFlatEntityMaps,
        },
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    return {
      status: 'success',
      action: {
        type: 'delete_database_event_trigger',
        databaseEventTriggerId: flatDatabaseEventTriggerToValidate.id,
      },
      dependencyOptimisticFlatEntityMaps,
    };
  }

  protected async validateFlatEntityUpdate({
    flatEntityUpdate: {
      from: fromFlatDatabaseEventTrigger,
      to: toFlatDatabaseEventTrigger,
    },
    optimisticFlatEntityMaps: optimisticFlatDatabaseEventTriggerMaps,
    dependencyOptimisticFlatEntityMaps,
  }: FlatEntityUpdateValidationArgs<
    typeof DATABASE_EVENT_TRIGGER_METADATA_NAME
  >): Promise<
    | FlatEntityValidationReturnType<
        typeof DATABASE_EVENT_TRIGGER_METADATA_NAME,
        'updated'
      >
    | undefined
  > {
    const databaseEventTriggerUpdatedProperties =
      compareTwoFlatDatabaseEventTrigger({
        fromFlatDatabaseEventTrigger,
        toFlatDatabaseEventTrigger,
      });

    if (databaseEventTriggerUpdatedProperties.length === 0) {
      return undefined;
    }

    const validationResult =
      this.flatDatabaseEventTriggerValidatorService.validateFlatDatabaseEventTriggerUpdate(
        {
          flatDatabaseEventTriggerToValidate: toFlatDatabaseEventTrigger,
          optimisticFlatDatabaseEventTriggerMaps,
          dependencyOptimisticFlatEntityMaps,
        },
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const updateDatabaseEventTriggerAction: UpdateDatabaseEventTriggerAction = {
      type: 'update_database_event_trigger',
      databaseEventTriggerId: toFlatDatabaseEventTrigger.id,
      updates: databaseEventTriggerUpdatedProperties,
    };

    return {
      status: 'success',
      action: updateDatabaseEventTriggerAction,
      dependencyOptimisticFlatEntityMaps,
    };
  }
}
