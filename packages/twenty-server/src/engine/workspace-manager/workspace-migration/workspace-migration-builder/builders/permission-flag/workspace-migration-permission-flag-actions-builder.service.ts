import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { type UniversalUpdatePermissionFlagAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/permission-flag/types/workspace-migration-permission-flag-action.type';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { type UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { type UniversalFlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-result.type';
import { WorkspaceEntityMigrationBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/services/workspace-entity-migration-builder.service';
import { validateFlatPermissionFlagCreation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-flat-permission-flag-creation.util';
import { validateFlatPermissionFlagDeletion } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-flat-permission-flag-deletion.util';
import { validateFlatPermissionFlagUpdate } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-flat-permission-flag-update.util';

@Injectable()
export class WorkspaceMigrationPermissionFlagActionsBuilderService extends WorkspaceEntityMigrationBuilderService<
  typeof ALL_METADATA_NAME.permissionFlag
> {
  constructor() {
    super(ALL_METADATA_NAME.permissionFlag);
  }

  protected validateFlatEntityCreation(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.permissionFlag
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.permissionFlag,
    'create'
  > {
    const validationResult = validateFlatPermissionFlagCreation(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatPermissionFlagToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'create',
        metadataName: 'permissionFlag',
        flatEntity: flatPermissionFlagToValidate,
      },
    };
  }

  protected validateFlatEntityDeletion(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.permissionFlag
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.permissionFlag,
    'delete'
  > {
    const validationResult = validateFlatPermissionFlagDeletion(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatPermissionFlagToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'delete',
        metadataName: 'permissionFlag',
        universalIdentifier: flatPermissionFlagToValidate.universalIdentifier,
      },
    };
  }

  protected validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<
      typeof ALL_METADATA_NAME.permissionFlag
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.permissionFlag,
    'update'
  > {
    const validationResult = validateFlatPermissionFlagUpdate(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { universalIdentifier, flatEntityUpdate } = args;

    const updateAction: UniversalUpdatePermissionFlagAction = {
      type: 'update',
      metadataName: 'permissionFlag',
      universalIdentifier,
      update: flatEntityUpdate,
    };

    return {
      status: 'success',
      action: updateAction,
    };
  }
}
