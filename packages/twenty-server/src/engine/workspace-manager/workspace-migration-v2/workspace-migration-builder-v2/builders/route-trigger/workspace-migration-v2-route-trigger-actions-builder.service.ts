import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { UpdateRouteTriggerAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/route-trigger/types/workspace-migration-route-trigger-action-v2.type';
import { WorkspaceEntityMigrationBuilderV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-entity-migration-builder-v2.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-update-validation-args.type';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';
import { FlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-result.type';
import { FlatRouteTriggerValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-route-trigger-validator.service';

@Injectable()
export class WorkspaceMigrationV2RouteTriggerActionsBuilderService extends WorkspaceEntityMigrationBuilderV2Service<
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
        entityId: flatRouteTriggerToValidate.id,
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
