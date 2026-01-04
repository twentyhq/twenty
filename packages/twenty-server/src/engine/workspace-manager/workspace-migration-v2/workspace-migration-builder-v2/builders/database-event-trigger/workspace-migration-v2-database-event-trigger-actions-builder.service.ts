import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { UpdateDatabaseEventTriggerAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/database-event-trigger/types/workspace-migration-database-event-trigger-action-v2.type';
import { WorkspaceEntityMigrationBuilderV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-entity-migration-builder-v2.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-update-validation-args.type';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';
import { FlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-result.type';
import { FlatDatabaseEventTriggerValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-database-event-trigger-validator.service';

@Injectable()
export class WorkspaceMigrationV2DatabaseEventTriggerActionsBuilderService extends WorkspaceEntityMigrationBuilderV2Service<
  typeof ALL_METADATA_NAME.databaseEventTrigger
> {
  constructor(
    private readonly flatDatabaseEventTriggerValidatorService: FlatDatabaseEventTriggerValidatorService,
  ) {
    super(ALL_METADATA_NAME.databaseEventTrigger);
  }

  protected validateFlatEntityCreation(
    args: FlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.databaseEventTrigger
    >,
  ): FlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.databaseEventTrigger,
    'create'
  > {
    const validationResult =
      this.flatDatabaseEventTriggerValidatorService.validateFlatDatabaseEventTriggerCreation(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatDatabaseEventTriggerToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'create',
        metadataName: 'databaseEventTrigger',
        flatEntity: flatDatabaseEventTriggerToValidate,
      },
    };
  }

  protected validateFlatEntityDeletion(
    args: FlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.databaseEventTrigger
    >,
  ): FlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.databaseEventTrigger,
    'delete'
  > {
    const validationResult =
      this.flatDatabaseEventTriggerValidatorService.validateFlatDatabaseEventTriggerDeletion(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatDatabaseEventTriggerToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'delete',
        metadataName: 'databaseEventTrigger',
        entityId: flatDatabaseEventTriggerToValidate.id,
      },
    };
  }

  protected validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<
      typeof ALL_METADATA_NAME.databaseEventTrigger
    >,
  ): FlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.databaseEventTrigger,
    'update'
  > {
    const validationResult =
      this.flatDatabaseEventTriggerValidatorService.validateFlatDatabaseEventTriggerUpdate(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityId, flatEntityUpdates } = args;

    const updateDatabaseEventTriggerAction: UpdateDatabaseEventTriggerAction = {
      type: 'update',
      metadataName: 'databaseEventTrigger',
      entityId: flatEntityId,
      updates: flatEntityUpdates,
    };

    return {
      status: 'success',
      action: updateDatabaseEventTriggerAction,
    };
  }
}
