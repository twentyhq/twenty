import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { UpdateRoleTargetAction } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/role-target/types/workspace-migration-role-target-action-v2.type';
import { WorkspaceEntityMigrationBuilderV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-entity-migration-builder-v2.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-update-validation-args.type';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';
import { FlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-result.type';
import { FlatRoleTargetValidatorService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/validators/services/flat-role-target-validator.service';

@Injectable()
export class WorkspaceMigrationV2RoleTargetActionsBuilderService extends WorkspaceEntityMigrationBuilderV2Service<
  typeof ALL_METADATA_NAME.roleTarget
> {
  constructor(
    private readonly flatRoleTargetValidatorService: FlatRoleTargetValidatorService,
  ) {
    super(ALL_METADATA_NAME.roleTarget);
  }

  protected async validateFlatEntityCreation(
    args: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.roleTarget>,
  ): Promise<
    FlatEntityValidationReturnType<
      typeof ALL_METADATA_NAME.roleTarget,
      'created'
    >
  > {
    const validationResult =
      this.flatRoleTargetValidatorService.validateFlatRoleTargetCreation(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatRoleTargetToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'create_role_target',
        roleTarget: flatRoleTargetToValidate,
      },
    };
  }

  protected async validateFlatEntityDeletion(
    args: FlatEntityValidationArgs<typeof ALL_METADATA_NAME.roleTarget>,
  ): Promise<
    FlatEntityValidationReturnType<
      typeof ALL_METADATA_NAME.roleTarget,
      'deleted'
    >
  > {
    const validationResult =
      this.flatRoleTargetValidatorService.validateFlatRoleTargetDeletion(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatRoleTargetToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'delete_role_target',
        roleTargetId: flatRoleTargetToValidate.id,
      },
    };
  }

  protected async validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<typeof ALL_METADATA_NAME.roleTarget>,
  ): Promise<
    FlatEntityValidationReturnType<
      typeof ALL_METADATA_NAME.roleTarget,
      'updated'
    >
  > {
    const validationResult =
      this.flatRoleTargetValidatorService.validateFlatRoleTargetUpdate(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityId, flatEntityUpdates } = args;

    const updateRoleTargetAction: UpdateRoleTargetAction = {
      type: 'update_role_target',
      roleTargetId: flatEntityId,
      updates: flatEntityUpdates,
    };

    return {
      status: 'success',
      action: updateRoleTargetAction,
    };
  }
}

