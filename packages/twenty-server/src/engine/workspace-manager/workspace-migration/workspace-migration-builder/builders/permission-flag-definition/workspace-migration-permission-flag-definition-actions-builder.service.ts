import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { type UniversalUpdatePermissionFlagDefinitionAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/permission-flag-definition/types/workspace-migration-permission-flag-definition-action.type';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { type UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { type UniversalFlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-result.type';
import { WorkspaceEntityMigrationBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/services/workspace-entity-migration-builder.service';
import { FlatPermissionFlagDefinitionValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-permission-flag-definition-validator.service';

@Injectable()
export class WorkspaceMigrationPermissionFlagDefinitionActionsBuilderService extends WorkspaceEntityMigrationBuilderService<
  typeof ALL_METADATA_NAME.permissionFlagDefinition
> {
  constructor(
    private readonly flatPermissionFlagDefinitionValidatorService: FlatPermissionFlagDefinitionValidatorService,
  ) {
    super(ALL_METADATA_NAME.permissionFlagDefinition);
  }

  protected validateFlatEntityCreation(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.permissionFlagDefinition
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.permissionFlagDefinition,
    'create'
  > {
    const validationResult =
      this.flatPermissionFlagDefinitionValidatorService.validateFlatPermissionFlagDefinitionCreation(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatPermissionFlagDefinitionToValidate } =
      args;

    return {
      status: 'success',
      action: {
        type: 'create',
        metadataName: 'permissionFlagDefinition',
        flatEntity: flatPermissionFlagDefinitionToValidate,
      },
    };
  }

  protected validateFlatEntityDeletion(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.permissionFlagDefinition
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.permissionFlagDefinition,
    'delete'
  > {
    const validationResult =
      this.flatPermissionFlagDefinitionValidatorService.validateFlatPermissionFlagDefinitionDeletion(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatPermissionFlagDefinitionToValidate } =
      args;

    return {
      status: 'success',
      action: {
        type: 'delete',
        metadataName: 'permissionFlagDefinition',
        universalIdentifier:
          flatPermissionFlagDefinitionToValidate.universalIdentifier,
      },
    };
  }

  protected validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<
      typeof ALL_METADATA_NAME.permissionFlagDefinition
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.permissionFlagDefinition,
    'update'
  > {
    const validationResult =
      this.flatPermissionFlagDefinitionValidatorService.validateFlatPermissionFlagDefinitionUpdate(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { universalIdentifier, flatEntityUpdate } = args;

    const updateAction: UniversalUpdatePermissionFlagDefinitionAction = {
      type: 'update',
      metadataName: 'permissionFlagDefinition',
      universalIdentifier,
      update: flatEntityUpdate,
    };

    return {
      status: 'success',
      action: updateAction,
    };
  }
}
