/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { ALL_METADATA_NAME } from 'twenty-shared/metadata';

import { UniversalUpdateRowLevelPermissionRuleAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/row-level-permission-rule/types/workspace-migration-row-level-permission-rule-action.type';
import { WorkspaceEntityMigrationBuilderService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/services/workspace-entity-migration-builder.service';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { UniversalFlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-result.type';
import { FlatRowLevelPermissionRuleValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-row-level-permission-rule-validator.service';

@Injectable()
export class WorkspaceMigrationRowLevelPermissionRuleActionsBuilderService extends WorkspaceEntityMigrationBuilderService<
  typeof ALL_METADATA_NAME.rowLevelPermissionRule
> {
  constructor(
    private readonly flatRowLevelPermissionRuleValidatorService: FlatRowLevelPermissionRuleValidatorService,
  ) {
    super(ALL_METADATA_NAME.rowLevelPermissionRule);
  }

  protected validateFlatEntityCreation(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.rowLevelPermissionRule
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.rowLevelPermissionRule,
    'create'
  > {
    const validationResult =
      this.flatRowLevelPermissionRuleValidatorService.validateFlatRowLevelPermissionRuleCreation(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { flatEntityToValidate } = args;

    return {
      status: 'success',
      action: {
        type: 'create',
        metadataName: 'rowLevelPermissionRule',
        flatEntity: flatEntityToValidate,
      },
    };
  }

  protected validateFlatEntityDeletion(
    args: UniversalFlatEntityValidationArgs<
      typeof ALL_METADATA_NAME.rowLevelPermissionRule
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.rowLevelPermissionRule,
    'delete'
  > {
    const validationResult =
      this.flatRowLevelPermissionRuleValidatorService.validateFlatRowLevelPermissionRuleDeletion(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const {
      flatEntityToValidate: { universalIdentifier: ruleUniversalIdentifier },
    } = args;

    return {
      status: 'success',
      action: {
        type: 'delete',
        metadataName: 'rowLevelPermissionRule',
        universalIdentifier: ruleUniversalIdentifier,
      },
    };
  }

  protected validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<
      typeof ALL_METADATA_NAME.rowLevelPermissionRule
    >,
  ): UniversalFlatEntityValidationReturnType<
    typeof ALL_METADATA_NAME.rowLevelPermissionRule,
    'update'
  > {
    const validationResult =
      this.flatRowLevelPermissionRuleValidatorService.validateFlatRowLevelPermissionRuleUpdate(
        args,
      );

    if (validationResult.errors.length > 0) {
      return {
        status: 'fail',
        ...validationResult,
      };
    }

    const { universalIdentifier, flatEntityUpdate } = args;

    const updateAction: UniversalUpdateRowLevelPermissionRuleAction = {
      type: 'update',
      metadataName: 'rowLevelPermissionRule',
      universalIdentifier,
      update: flatEntityUpdate,
    };

    return {
      status: 'success',
      action: updateAction,
    };
  }
}
