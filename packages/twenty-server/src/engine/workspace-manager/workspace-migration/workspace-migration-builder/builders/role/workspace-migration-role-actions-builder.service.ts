import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { UpdateRoleAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/role/types/workspace-migration-role-action.type';
import { WorkspaceEntityMigrationBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/services/workspace-entity-migration-builder.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/flat-entity-update-validation-args.type';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/flat-entity-validation-args.type';
import { FlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/flat-entity-validation-result.type';
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
    args: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.role>,
  ): FlatEntityValidationReturnType<typeof ALL_METADATA_NAME.role, 'create'> {
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
    args: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.role>,
  ): FlatEntityValidationReturnType<typeof ALL_METADATA_NAME.role, 'delete'> {
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
  ): FlatEntityValidationReturnType<typeof ALL_METADATA_NAME.role, 'update'> {
    const validationResult =
      this.flatRoleValidatorService.validateFlatRoleUpdate(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityId, flatEntityUpdates } = args;

    const updateRoleAction: UpdateRoleAction = {
      type: 'update',
      metadataName: 'role',
      entityId: flatEntityId,
      updates: flatEntityUpdates,
    };

    return {
      status: 'success',
      action: updateRoleAction,
    };
  }
}
