import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { UniversalUpdateRoleTargetAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/role-target/types/workspace-migration-role-target-action.type';
import { WorkspaceEntityMigrationBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/services/workspace-entity-migration-builder.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { UniversalFlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-result.type';
import { FlatRoleTargetValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-role-target-validator.service';

@Injectable()
export class WorkspaceMigrationRoleTargetActionsBuilderService extends WorkspaceEntityMigrationBuilderService<
  typeof ALL_METADATA_NAME.roleTarget
> {
  constructor(
    private readonly flatRoleTargetValidatorService: FlatRoleTargetValidatorService,
  ) {
    super(ALL_METADATA_NAME.roleTarget);
  }

  protected validateFlatEntityCreation(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.roleTarget
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.roleTarget,
    'create'
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
        type: 'create',
        metadataName: 'roleTarget',
        flatEntity: flatRoleTargetToValidate,
      },
    };
  }

  protected validateFlatEntityDeletion(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.roleTarget
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.roleTarget,
    'delete'
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
        type: 'delete',
        metadataName: 'roleTarget',
        universalIdentifier: flatRoleTargetToValidate.universalIdentifier,
      },
    };
  }

  protected validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<typeof ALL_METADATA_NAME.roleTarget>,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.roleTarget,
    'update'
  > {
    const validationResult =
      this.flatRoleTargetValidatorService.validateFlatRoleTargetUpdate(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { universalIdentifier, flatEntityUpdate } = args;

    const updateRoleTargetAction: UniversalUpdateRoleTargetAction = {
      type: 'update',
      metadataName: 'roleTarget',
      universalIdentifier,
      update: flatEntityUpdate,
    };

    return {
      status: 'success',
      action: updateRoleTargetAction,
    };
  }
}
