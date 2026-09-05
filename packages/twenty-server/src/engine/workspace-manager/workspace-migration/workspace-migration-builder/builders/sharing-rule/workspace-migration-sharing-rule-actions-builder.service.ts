import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { UniversalUpdateSharingRuleAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/sharing-rule/types/workspace-migration-sharing-rule-action.type';
import { WorkspaceEntityMigrationBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/services/workspace-entity-migration-builder.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { UniversalFlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-result.type';
import { FlatSharingRuleValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-sharing-rule-validator.service';

@Injectable()
export class WorkspaceMigrationSharingRuleActionsBuilderService extends WorkspaceEntityMigrationBuilderService<
  typeof ALL_METADATA_NAME.sharingRule
> {
  constructor(
    private readonly flatSharingRuleValidatorService: FlatSharingRuleValidatorService,
  ) {
    super(ALL_METADATA_NAME.sharingRule);
  }

  protected validateFlatEntityCreation(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.sharingRule
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.sharingRule,
    'create'
  > {
    const validationResult =
      this.flatSharingRuleValidatorService.validateFlatSharingRuleCreation(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    return {
      status: 'success',
      action: {
        type: 'create',
        metadataName: 'sharingRule',
        flatEntity: args.flatEntityToValidate,
      },
    };
  }

  protected validateFlatEntityDeletion(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.sharingRule
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.sharingRule,
    'delete'
  > {
    const validationResult =
      this.flatSharingRuleValidatorService.validateFlatSharingRuleDeletion(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    return {
      status: 'success',
      action: {
        type: 'delete',
        metadataName: 'sharingRule',
        universalIdentifier: args.flatEntityToValidate.universalIdentifier,
      },
    };
  }

  protected validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<typeof ALL_METADATA_NAME.sharingRule>,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.sharingRule,
    'update'
  > {
    const validationResult =
      this.flatSharingRuleValidatorService.validateFlatSharingRuleUpdate(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { universalIdentifier, flatEntityUpdate } = args;

    const updateSharingRuleAction: UniversalUpdateSharingRuleAction = {
      type: 'update',
      metadataName: 'sharingRule',
      universalIdentifier,
      update: flatEntityUpdate,
    };

    return {
      status: 'success',
      action: updateSharingRuleAction,
    };
  }
}
