import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { UniversalUpdateSettingsMenuItemAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/settings-menu-item/types/workspace-migration-settings-menu-item-action.type';
import { WorkspaceEntityMigrationBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/services/workspace-entity-migration-builder.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { UniversalFlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-result.type';
import { FlatSettingsMenuItemValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-settings-menu-item-validator.service';

@Injectable()
export class WorkspaceMigrationSettingsMenuItemActionsBuilderService extends WorkspaceEntityMigrationBuilderService<
  typeof ALL_METADATA_NAME.settingsMenuItem
> {
  constructor(
    private readonly flatSettingsMenuItemValidatorService: FlatSettingsMenuItemValidatorService,
  ) {
    super(ALL_METADATA_NAME.settingsMenuItem);
  }

  protected validateFlatEntityCreation(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.settingsMenuItem
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.settingsMenuItem,
    'create'
  > {
    const validationResult =
      this.flatSettingsMenuItemValidatorService.validateFlatSettingsMenuItemCreation(
        args,
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
        type: 'create',
        metadataName: 'settingsMenuItem',
        flatEntity: args.flatEntityToValidate,
      },
    };
  }

  protected validateFlatEntityDeletion(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.settingsMenuItem
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.settingsMenuItem,
    'delete'
  > {
    const validationResult =
      this.flatSettingsMenuItemValidatorService.validateFlatSettingsMenuItemDeletion(
        args,
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
        type: 'delete',
        metadataName: 'settingsMenuItem',
        universalIdentifier: args.flatEntityToValidate.universalIdentifier,
      },
    };
  }

  protected validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<
      typeof ALL_METADATA_NAME.settingsMenuItem
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.settingsMenuItem,
    'update'
  > {
    const validationResult =
      this.flatSettingsMenuItemValidatorService.validateFlatSettingsMenuItemUpdate(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { universalIdentifier, flatEntityUpdate } = args;

    const updateSettingsMenuItemAction: UniversalUpdateSettingsMenuItemAction =
      {
        type: 'update',
        metadataName: 'settingsMenuItem',
        universalIdentifier,
        update: flatEntityUpdate,
      };

    return {
      status: 'success',
      action: updateSettingsMenuItemAction,
    };
  }
}
