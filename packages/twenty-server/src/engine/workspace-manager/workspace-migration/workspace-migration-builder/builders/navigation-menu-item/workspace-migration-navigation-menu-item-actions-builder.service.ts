import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { UniversalUpdateNavigationMenuItemAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/navigation-menu-item/types/workspace-migration-navigation-menu-item-action.type';
import { WorkspaceEntityMigrationBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/services/workspace-entity-migration-builder.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { UniversalFlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-result.type';
import { FlatNavigationMenuItemValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-navigation-menu-item-validator.service';

@Injectable()
export class WorkspaceMigrationNavigationMenuItemActionsBuilderService extends WorkspaceEntityMigrationBuilderService<
  typeof ALL_METADATA_NAME.navigationMenuItem
> {
  constructor(
    private readonly flatNavigationMenuItemValidatorService: FlatNavigationMenuItemValidatorService,
  ) {
    super(ALL_METADATA_NAME.navigationMenuItem);
  }

  protected validateFlatEntityCreation(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.navigationMenuItem
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.navigationMenuItem,
    'create'
  > {
    const validationResult =
      this.flatNavigationMenuItemValidatorService.validateFlatNavigationMenuItemCreation(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatNavigationMenuItemToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'create',
        metadataName: 'navigationMenuItem',
        flatEntity: flatNavigationMenuItemToValidate,
      },
    };
  }

  protected validateFlatEntityDeletion(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.navigationMenuItem
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.navigationMenuItem,
    'delete'
  > {
    const validationResult =
      this.flatNavigationMenuItemValidatorService.validateFlatNavigationMenuItemDeletion(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatNavigationMenuItemToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'delete',
        metadataName: 'navigationMenuItem',
        universalIdentifier:
          flatNavigationMenuItemToValidate.universalIdentifier,
      },
    };
  }

  protected validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<
      typeof ALL_METADATA_NAME.navigationMenuItem
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.navigationMenuItem,
    'update'
  > {
    const validationResult =
      this.flatNavigationMenuItemValidatorService.validateFlatNavigationMenuItemUpdate(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { universalIdentifier, flatEntityUpdate } = args;

    const updateNavigationMenuItemAction: UniversalUpdateNavigationMenuItemAction =
      {
        type: 'update',
        metadataName: 'navigationMenuItem',
        universalIdentifier,
        update: flatEntityUpdate,
      };

    return {
      status: 'success',
      action: updateNavigationMenuItemAction,
    };
  }
}
