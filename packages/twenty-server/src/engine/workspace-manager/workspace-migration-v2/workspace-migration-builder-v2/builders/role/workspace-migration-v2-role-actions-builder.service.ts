import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { UpdateRoleAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/role/types/workspace-migration-role-action-v2.type';
import { WorkspaceEntityMigrationBuilderV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-entity-migration-builder-v2.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-update-validation-args.type';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';
import { FlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-result.type';
import { FlatRoleValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-role-validator.service';

@Injectable()
export class WorkspaceMigrationV2RoleActionsBuilderService extends WorkspaceEntityMigrationBuilderV2Service<
  typeof ALL_METADATA_NAME.role
> {
  constructor(
    private readonly flatRoleValidatorService: FlatRoleValidatorService,
  ) {
    super(ALL_METADATA_NAME.role);
  }

  protected validateFlatEntityCreation(
    args: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.role>,
  ): FlatEntityValidationReturnType<typeof ALL_METADATA_NAME.role, 'created'> {
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
        type: 'create_role',
        role: flatRoleToValidate,
      },
    };
  }

  protected validateFlatEntityDeletion(
    args: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.role>,
  ): FlatEntityValidationReturnType<typeof ALL_METADATA_NAME.role, 'deleted'> {
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
        type: 'delete_role',
        roleId: flatRoleToValidate.id,
      },
    };
  }

  protected validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<typeof ALL_METADATA_NAME.role>,
  ): FlatEntityValidationReturnType<typeof ALL_METADATA_NAME.role, 'updated'> {
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
      type: 'update_role',
      roleId: flatEntityId,
      updates: flatEntityUpdates,
    };

    return {
      status: 'success',
      action: updateRoleAction,
    };
  }
}
