/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { UniversalUpdateRecordInheritanceRuleAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/record-inheritance-rule/types/workspace-migration-record-inheritance-rule-action.type';
import { WorkspaceEntityMigrationBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/services/workspace-entity-migration-builder.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { UniversalFlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-result.type';
import { FlatRecordInheritanceRuleValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-record-inheritance-rule-validator.service';

@Injectable()
export class WorkspaceMigrationRecordInheritanceRuleActionsBuilderService extends WorkspaceEntityMigrationBuilderService<
  typeof ALL_METADATA_NAME.recordInheritanceRule
> {
  constructor(
    private readonly flatRecordInheritanceRuleValidatorService: FlatRecordInheritanceRuleValidatorService,
  ) {
    super(ALL_METADATA_NAME.recordInheritanceRule);
  }

  protected validateFlatEntityCreation(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.recordInheritanceRule
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.recordInheritanceRule,
    'create'
  > {
    const validationResult =
      this.flatRecordInheritanceRuleValidatorService.validateFlatRecordInheritanceRuleCreation(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatRecordInheritanceRuleToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'create',
        metadataName: 'recordInheritanceRule',
        flatEntity: flatRecordInheritanceRuleToValidate,
      },
    };
  }

  protected validateFlatEntityDeletion(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.recordInheritanceRule
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.recordInheritanceRule,
    'delete'
  > {
    const validationResult =
      this.flatRecordInheritanceRuleValidatorService.validateFlatRecordInheritanceRuleDeletion(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate: flatRecordInheritanceRuleToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'delete',
        metadataName: 'recordInheritanceRule',
        universalIdentifier:
          flatRecordInheritanceRuleToValidate.universalIdentifier,
      },
    };
  }

  protected validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<
      typeof ALL_METADATA_NAME.recordInheritanceRule
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.recordInheritanceRule,
    'update'
  > {
    const validationResult =
      this.flatRecordInheritanceRuleValidatorService.validateFlatRecordInheritanceRuleUpdate(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { universalIdentifier, flatEntityUpdate } = args;

    const updateRecordInheritanceRuleAction: UniversalUpdateRecordInheritanceRuleAction =
      {
        type: 'update',
        metadataName: 'recordInheritanceRule',
        universalIdentifier,
        update: flatEntityUpdate,
      };

    return {
      status: 'success',
      action: updateRecordInheritanceRuleAction,
    };
  }
}
