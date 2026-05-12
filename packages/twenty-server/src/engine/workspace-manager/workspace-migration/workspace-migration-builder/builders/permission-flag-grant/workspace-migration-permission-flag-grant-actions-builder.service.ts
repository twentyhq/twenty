import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { WorkspaceEntityMigrationBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/services/workspace-entity-migration-builder.service';
import { UniversalUpdatePermissionFlagGrantAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/permission-flag-grant/types/workspace-migration-permission-flag-grant-action.type';
import { FlatPermissionFlagGrantValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-permission-flag-grant-validator.service';
import { UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { UniversalFlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-result.type';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';

@Injectable()
export class WorkspaceMigrationPermissionFlagGrantActionsBuilderService extends WorkspaceEntityMigrationBuilderService<
  typeof ALL_METADATA_NAME.permissionFlagGrant
> {
  constructor(
    private readonly flatPermissionFlagGrantValidatorService: FlatPermissionFlagGrantValidatorService,
  ) {
    super(ALL_METADATA_NAME.permissionFlagGrant);
  }

  protected validateFlatEntityCreation(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.permissionFlagGrant
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.permissionFlagGrant,
    'create'
  > {
    const validationResult =
      this.flatPermissionFlagGrantValidatorService.validateFlatPermissionFlagGrantCreation(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatPermissionFlagGrantToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'create',
        metadataName: 'permissionFlagGrant',
        flatEntity: flatPermissionFlagGrantToValidate,
      },
    };
  }

  protected validateFlatEntityDeletion(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.permissionFlagGrant
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.permissionFlagGrant,
    'delete'
  > {
    const validationResult =
      this.flatPermissionFlagGrantValidatorService.validateFlatPermissionFlagGrantDeletion(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatPermissionFlagGrantToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'delete',
        metadataName: 'permissionFlagGrant',
        universalIdentifier:
          flatPermissionFlagGrantToValidate.universalIdentifier,
      },
    };
  }

  protected validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<
      typeof ALL_METADATA_NAME.permissionFlagGrant
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.permissionFlagGrant,
    'update'
  > {
    const validationResult =
      this.flatPermissionFlagGrantValidatorService.validateFlatPermissionFlagGrantUpdate(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { universalIdentifier, flatEntityUpdate } = args;

    const updatePermissionFlagGrantAction: UniversalUpdatePermissionFlagGrantAction =
      {
        type: 'update',
        metadataName: 'permissionFlagGrant',
        universalIdentifier,
        update: flatEntityUpdate,
      };

    return {
      status: 'success',
      action: updatePermissionFlagGrantAction,
    };
  }
}
