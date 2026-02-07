import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { UniversalUpdateRoleAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/role/types/workspace-migration-role-action.type';
import { WorkspaceEntityMigrationBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/services/workspace-entity-migration-builder.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { UniversalFlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-result.type';
import { FlatRoleValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-role-validator.service';

@Injectable()
export class WorkspaceMigrationRoleActionsBuilderService extends WorkspaceEntityMigrationBuilderService<
  typeof ALL_METADATA_NAME.role
> {
  constructor(
    private readonly flatRoleValidatorService: FlatRoleValidatorService,
  ) {
    super(ALL_METADATA_NAME.role);
  }

  protected validateFlatEntityCreation(
    args: UniversalFlatEntityValidationArgs<typeof ALL_METADATA_NAME.role>,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.role,
    'create'
  > {
    const validationResult =
      this.flatRoleValidatorService.validateFlatRoleCreation(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatRoleToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'create',
        metadataName: 'role',
        flatEntity: flatRoleToValidate,
      },
    };
  }

  protected validateFlatEntityDeletion(
    args: UniversalFlatEntityValidationArgs<typeof ALL_METADATA_NAME.role>,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.role,
    'delete'
  > {
    const validationResult =
      this.flatRoleValidatorService.validateFlatRoleDeletion(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatRoleToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'delete',
        metadataName: 'role',
        universalIdentifier: flatRoleToValidate.universalIdentifier,
      },
    };
  }

  protected validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<typeof ALL_METADATA_NAME.role>,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.role,
    'update'
  > {
    const validationResult =
      this.flatRoleValidatorService.validateFlatRoleUpdate(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { universalIdentifier, flatEntityUpdate } = args;

    const updateRoleAction: UniversalUpdateRoleAction = {
      type: 'update',
      metadataName: 'role',
      universalIdentifier,
      update: flatEntityUpdate,
    };

    return {
      status: 'success',
      action: updateRoleAction,
    };
  }
}
