import { Injectable } from '@nestjs/common';

import { FlatDatabaseEventTrigger } from 'src/engine/metadata-modules/database-event-trigger/types/flat-database-event-trigger.type';
import { compareTwoFlatDatabaseEventTrigger } from 'src/engine/metadata-modules/database-event-trigger/utils/compare-two-flat-database-event-trigger.util';
import { DatabaseEventTriggerRelatedFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/database-event-trigger/types/database-event-trigger-related-flat-entity-maps.type';
import {
  FlatEntityUpdateValidationArgs,
  FlatEntityValidationArgs,
  FlatEntityValidationReturnType,
  WorkspaceEntityMigrationBuilderV2Service,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-entity-migration-builder-v2.service';
import {
  UpdateDatabaseEventTriggerAction,
  WorkspaceMigrationDatabaseEventTriggerActionV2,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-database-event-trigger-action-v2.type';
import { FlatDatabaseEventTriggerValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-database-event-trigger-validator.service';

@Injectable()
export class WorkspaceMigrationV2DatabaseEventTriggerActionsBuilderService extends WorkspaceEntityMigrationBuilderV2Service<
  'databaseEventTrigger',
  FlatDatabaseEventTrigger,
  WorkspaceMigrationDatabaseEventTriggerActionV2,
  DatabaseEventTriggerRelatedFlatEntityMaps
> {
  constructor(
    private readonly flatDatabaseEventTriggerValidatorService: FlatDatabaseEventTriggerValidatorService,
  ) {
    super('databaseEventTrigger');
  }

  protected async validateFlatEntityCreation({
    flatEntityToValidate: flatDatabaseEventTriggerToValidate,
    optimisticFlatEntityMaps: optimisticFlatDatabaseEventTriggerMaps,
    dependencyOptimisticFlatEntityMaps,
  }: FlatEntityValidationArgs<
    FlatDatabaseEventTrigger,
    DatabaseEventTriggerRelatedFlatEntityMaps
  >): Promise<
    FlatEntityValidationReturnType<
      WorkspaceMigrationDatabaseEventTriggerActionV2,
      FlatDatabaseEventTrigger,
      DatabaseEventTriggerRelatedFlatEntityMaps
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
    FlatDatabaseEventTrigger,
    DatabaseEventTriggerRelatedFlatEntityMaps
  >): Promise<
    FlatEntityValidationReturnType<
      WorkspaceMigrationDatabaseEventTriggerActionV2,
      FlatDatabaseEventTrigger,
      DatabaseEventTriggerRelatedFlatEntityMaps
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
    FlatDatabaseEventTrigger,
    DatabaseEventTriggerRelatedFlatEntityMaps
  >): Promise<
    | FlatEntityValidationReturnType<
        WorkspaceMigrationDatabaseEventTriggerActionV2,
        FlatDatabaseEventTrigger,
        DatabaseEventTriggerRelatedFlatEntityMaps
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
