import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { UpdateRouteTriggerAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/route-trigger/types/workspace-migration-route-trigger-action.type';
import { WorkspaceEntityMigrationBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/services/workspace-entity-migration-builder.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/flat-entity-update-validation-args.type';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/flat-entity-validation-args.type';
import { FlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/flat-entity-validation-result.type';
import { FlatRouteTriggerValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-route-trigger-validator.service';

@Injectable()
export class WorkspaceMigrationRouteTriggerActionsBuilderService extends WorkspaceEntityMigrationBuilderService<
  typeof ALL_METADATA_NAME.routeTrigger
> {
  constructor(
    private readonly flatRouteTriggerValidatorService: FlatRouteTriggerValidatorService,
  ) {
    super(ALL_METADATA_NAME.routeTrigger);
  }

  protected validateFlatEntityCreation(
    args: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.routeTrigger>,
  ): FlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.routeTrigger,
    'create'
  > {
    const validationResult =
      this.flatRouteTriggerValidatorService.validateFlatRouteTriggerCreation(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatRouteTriggerToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'create',
        metadataName: 'routeTrigger',
        flatEntity: flatRouteTriggerToValidate,
      },
    };
  }

  protected validateFlatEntityDeletion(
    args: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.routeTrigger>,
  ): FlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.routeTrigger,
    'delete'
  > {
    const validationResult =
      this.flatRouteTriggerValidatorService.validateFlatRouteTriggerDeletion(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatRouteTriggerToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'delete',
        metadataName: 'routeTrigger',
        universalIdentifier: flatRouteTriggerToValidate.universalIdentifier,
      },
    };
  }

  protected validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<typeof ALL_METADATA_NAME.routeTrigger>,
  ): FlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.routeTrigger,
    'update'
  > {
    const validationResult =
      this.flatRouteTriggerValidatorService.validateFlatRouteTriggerUpdate(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityId, flatEntityUpdates } = args;

    const updateRouteTriggerAction: UpdateRouteTriggerAction = {
      type: 'update',
      metadataName: 'routeTrigger',
      entityId: flatEntityId,
      updates: flatEntityUpdates,
    };

    return {
      status: 'success',
      action: updateRouteTriggerAction,
    };
  }
}
