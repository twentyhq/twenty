import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { UniversalUpdateCommandMenuItemAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/command-menu-item/types/workspace-migration-command-menu-item-action.type';
import { WorkspaceEntityMigrationBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/services/workspace-entity-migration-builder.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { UniversalFlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-result.type';
import { FlatCommandMenuItemValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-command-menu-item-validator.service';

@Injectable()
export class WorkspaceMigrationCommandMenuItemActionsBuilderService extends WorkspaceEntityMigrationBuilderService<
  typeof ALL_METADATA_NAME.commandMenuItem
> {
  constructor(
    private readonly flatCommandMenuItemValidatorService: FlatCommandMenuItemValidatorService,
  ) {
    super(ALL_METADATA_NAME.commandMenuItem);
  }

  protected validateFlatEntityCreation(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.commandMenuItem
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.commandMenuItem,
    'create'
  > {
    const validationResult =
      this.flatCommandMenuItemValidatorService.validateFlatCommandMenuItemCreation(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatCommandMenuItemToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'create',
        metadataName: 'commandMenuItem',
        flatEntity: flatCommandMenuItemToValidate,
      },
    };
  }

  protected validateFlatEntityDeletion(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.commandMenuItem
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.commandMenuItem,
    'delete'
  > {
    const validationResult =
      this.flatCommandMenuItemValidatorService.validateFlatCommandMenuItemDeletion(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatCommandMenuItemToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'delete',
        metadataName: 'commandMenuItem',
        universalIdentifier: flatCommandMenuItemToValidate.universalIdentifier,
      },
    };
  }

  protected validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<
      typeof ALL_METADATA_NAME.commandMenuItem
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.commandMenuItem,
    'update'
  > {
    const validationResult =
      this.flatCommandMenuItemValidatorService.validateFlatCommandMenuItemUpdate(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { universalIdentifier, flatEntityUpdate } = args;

    const updateCommandMenuItemAction: UniversalUpdateCommandMenuItemAction = {
      type: 'update',
      metadataName: 'commandMenuItem',
      universalIdentifier,
      update: flatEntityUpdate,
    };

    return {
      status: 'success',
      action: updateCommandMenuItemAction,
    };
  }
}
