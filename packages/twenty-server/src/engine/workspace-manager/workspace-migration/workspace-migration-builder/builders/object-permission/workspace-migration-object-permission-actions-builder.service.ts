import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { WorkspaceEntityMigrationBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/services/workspace-entity-migration-builder.service';
import { UniversalUpdateObjectPermissionAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/object-permission/types/workspace-migration-object-permission-action.type';
import { FlatObjectPermissionValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-object-permission-validator.service';
import { UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { UniversalFlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-result.type';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';

@Injectable()
export class WorkspaceMigrationObjectPermissionActionsBuilderService extends WorkspaceEntityMigrationBuilderService<
  typeof ALL_METADATA_NAME.objectPermission
> {
  constructor(
    private readonly flatObjectPermissionValidatorService: FlatObjectPermissionValidatorService,
  ) {
    super(ALL_METADATA_NAME.objectPermission);
  }

  protected validateFlatEntityCreation(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.objectPermission
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.objectPermission,
    'create'
  > {
    const validationResult =
      this.flatObjectPermissionValidatorService.validateFlatObjectPermissionCreation(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatObjectPermissionToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'create',
        metadataName: 'objectPermission',
        flatEntity: flatObjectPermissionToValidate,
      },
    };
  }

  protected validateFlatEntityDeletion(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.objectPermission
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.objectPermission,
    'delete'
  > {
    const validationResult =
      this.flatObjectPermissionValidatorService.validateFlatObjectPermissionDeletion(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatObjectPermissionToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'delete',
        metadataName: 'objectPermission',
        universalIdentifier: flatObjectPermissionToValidate.universalIdentifier,
      },
    };
  }

  protected validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<
      typeof ALL_METADATA_NAME.objectPermission
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.objectPermission,
    'update'
  > {
    const validationResult =
      this.flatObjectPermissionValidatorService.validateFlatObjectPermissionUpdate(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { universalIdentifier, flatEntityUpdate } = args;

    const updateObjectPermissionAction: UniversalUpdateObjectPermissionAction =
      {
        type: 'update',
        metadataName: 'objectPermission',
        universalIdentifier,
        update: flatEntityUpdate,
      };

    return {
      status: 'success',
      action: updateObjectPermissionAction,
    };
  }
}
