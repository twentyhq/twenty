import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { WorkspaceEntityMigrationBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/services/workspace-entity-migration-builder.service';
import { UniversalUpdateRolePermissionFlagAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/role-permission-flag/types/workspace-migration-role-permission-flag-action.type';
import { FlatRolePermissionFlagValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-role-permission-flag-validator.service';
import { UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { UniversalFlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-result.type';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';

@Injectable()
export class WorkspaceMigrationRolePermissionFlagActionsBuilderService extends WorkspaceEntityMigrationBuilderService<
  typeof ALL_METADATA_NAME.rolePermissionFlag
> {
  constructor(
    private readonly flatRolePermissionFlagValidatorService: FlatRolePermissionFlagValidatorService,
  ) {
    super(ALL_METADATA_NAME.rolePermissionFlag);
  }

  protected validateFlatEntityCreation(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.rolePermissionFlag
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.rolePermissionFlag,
    'create'
  > {
    const validationResult =
      this.flatRolePermissionFlagValidatorService.validateFlatRolePermissionFlagCreation(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatRolePermissionFlagToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'create',
        metadataName: 'rolePermissionFlag',
        flatEntity: flatRolePermissionFlagToValidate,
      },
    };
  }

  protected validateFlatEntityDeletion(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.rolePermissionFlag
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.rolePermissionFlag,
    'delete'
  > {
    const validationResult =
      this.flatRolePermissionFlagValidatorService.validateFlatRolePermissionFlagDeletion(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatRolePermissionFlagToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'delete',
        metadataName: 'rolePermissionFlag',
        universalIdentifier:
          flatRolePermissionFlagToValidate.universalIdentifier,
      },
    };
  }

  protected validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<
      typeof ALL_METADATA_NAME.rolePermissionFlag
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.rolePermissionFlag,
    'update'
  > {
    const validationResult =
      this.flatRolePermissionFlagValidatorService.validateFlatRolePermissionFlagUpdate(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { universalIdentifier, flatEntityUpdate } = args;

    const updateRolePermissionFlagAction: UniversalUpdateRolePermissionFlagAction =
      {
        type: 'update',
        metadataName: 'rolePermissionFlag',
        universalIdentifier,
        update: flatEntityUpdate,
      };

    return {
      status: 'success',
      action: updateRolePermissionFlagAction,
    };
  }
}
