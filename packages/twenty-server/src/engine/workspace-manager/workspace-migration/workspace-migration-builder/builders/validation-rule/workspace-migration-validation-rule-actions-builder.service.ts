import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { UniversalUpdateValidationRuleAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/validation-rule/types/workspace-migration-validation-rule-action.type';
import { WorkspaceEntityMigrationBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/services/workspace-entity-migration-builder.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { UniversalFlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-result.type';
import { FlatValidationRuleValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-validation-rule-validator.service';

@Injectable()
export class WorkspaceMigrationValidationRuleActionsBuilderService extends WorkspaceEntityMigrationBuilderService<
  typeof ALL_METADATA_NAME.validationRule
> {
  constructor(
    private readonly flatValidationRuleValidatorService: FlatValidationRuleValidatorService,
  ) {
    super(ALL_METADATA_NAME.validationRule);
  }

  protected validateFlatEntityCreation(
    args: UniversalFlatEntityValidationArgs<typeof ALL_METADATA_NAME.validationRule>,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.validationRule,
    'create'
  > {
    const validationResult =
      this.flatValidationRuleValidatorService.validateFlatValidationRuleCreation(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatValidationRuleToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'create',
        metadataName: 'validationRule',
        flatEntity: flatValidationRuleToValidate,
      },
    };
  }

  protected validateFlatEntityDeletion(
    args: UniversalFlatEntityValidationArgs<typeof ALL_METADATA_NAME.validationRule>,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.validationRule,
    'delete'
  > {
    const validationResult =
      this.flatValidationRuleValidatorService.validateFlatValidationRuleDeletion(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatValidationRuleToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'delete',
        metadataName: 'validationRule',
        universalIdentifier: flatValidationRuleToValidate.universalIdentifier,
      },
    };
  }

  protected validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<typeof ALL_METADATA_NAME.validationRule>,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.validationRule,
    'update'
  > {
    const validationResult =
      this.flatValidationRuleValidatorService.validateFlatValidationRuleUpdate(args);

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { universalIdentifier, flatEntityUpdate } = args;

    const updateValidationRuleAction: UniversalUpdateValidationRuleAction = {
      type: 'update',
      metadataName: 'validationRule',
      universalIdentifier,
      update: flatEntityUpdate,
    };

    return {
      status: 'success',
      action: updateValidationRuleAction,
    };
  }
}
