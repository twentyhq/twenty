/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { RowLevelPermissionRuleExceptionCode } from 'src/engine/metadata-modules/row-level-permission-predicate/exceptions/row-level-permission-rule.exception';
import { type UniversalFlatRowLevelPermissionRule } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-row-level-permission-rule.type';
import {
  type FailedFlatEntityValidation,
  type FlatEntityValidationError,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';

type RuleRelatedFlatEntityMaps = UniversalFlatEntityValidationArgs<
  typeof ALL_METADATA_NAME.rowLevelPermissionRule
>['optimisticFlatEntityMapsAndRelatedFlatEntityMaps'];

@Injectable()
export class FlatRowLevelPermissionRuleValidatorService {
  validateFlatRowLevelPermissionRuleCreation({
    flatEntityToValidate: flatRuleToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.rowLevelPermissionRule
  >): FailedFlatEntityValidation<'rowLevelPermissionRule', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatRuleToValidate.universalIdentifier,
      },
      metadataName: 'rowLevelPermissionRule',
      type: 'create',
    });

    const existingRule = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatRuleToValidate.universalIdentifier,
      flatEntityMaps:
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps.flatRowLevelPermissionRuleMaps,
    });

    if (isDefined(existingRule)) {
      validationResult.errors.push({
        code: RowLevelPermissionRuleExceptionCode.INVALID_ROW_LEVEL_PERMISSION_RULE_DATA,
        message: t`Row level permission rule with this universal identifier already exists`,
        userFriendlyMessage: msg`Row level permission rule already exists`,
      });
    }

    validationResult.errors.push(
      ...this.getRoleAndObjectErrors({
        flatRule: flatRuleToValidate,
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
      }),
    );

    return validationResult;
  }

  validateFlatRowLevelPermissionRuleDeletion({
    flatEntityToValidate: flatRuleToDelete,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.rowLevelPermissionRule
  >): FailedFlatEntityValidation<'rowLevelPermissionRule', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatRuleToDelete.universalIdentifier,
      },
      metadataName: 'rowLevelPermissionRule',
      type: 'delete',
    });

    const existingRule = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatRuleToDelete.universalIdentifier,
      flatEntityMaps:
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps.flatRowLevelPermissionRuleMaps,
    });

    if (!isDefined(existingRule)) {
      validationResult.errors.push({
        code: RowLevelPermissionRuleExceptionCode.ROW_LEVEL_PERMISSION_RULE_NOT_FOUND,
        message: t`Row level permission rule to delete not found`,
        userFriendlyMessage: msg`Row level permission rule to delete not found`,
      });
    }

    return validationResult;
  }

  validateFlatRowLevelPermissionRuleUpdate({
    universalIdentifier,
    flatEntityUpdate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.rowLevelPermissionRule
  >): FailedFlatEntityValidation<'rowLevelPermissionRule', 'update'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: { universalIdentifier },
      metadataName: 'rowLevelPermissionRule',
      type: 'update',
    });

    const existingRule = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps:
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps.flatRowLevelPermissionRuleMaps,
    });

    if (!isDefined(existingRule)) {
      validationResult.errors.push({
        code: RowLevelPermissionRuleExceptionCode.ROW_LEVEL_PERMISSION_RULE_NOT_FOUND,
        message: t`Row level permission rule to update not found`,
        userFriendlyMessage: msg`Row level permission rule to update not found`,
      });

      return validationResult;
    }

    validationResult.errors.push(
      ...this.getRoleAndObjectErrors({
        flatRule: { ...existingRule, ...flatEntityUpdate },
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
      }),
    );

    return validationResult;
  }

  private getRoleAndObjectErrors({
    flatRule,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatRoleMaps,
      flatObjectMetadataMaps,
    },
  }: {
    flatRule: Pick<
      UniversalFlatRowLevelPermissionRule,
      'roleUniversalIdentifier' | 'objectMetadataUniversalIdentifier'
    >;
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: RuleRelatedFlatEntityMaps;
  }): FlatEntityValidationError[] {
    const errors: FlatEntityValidationError[] = [];

    const role = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatRule.roleUniversalIdentifier,
      flatEntityMaps: flatRoleMaps,
    });

    // Rules are written with their predicates and groups, which already reject a non-editable role
    if (!isDefined(role)) {
      errors.push({
        code: RowLevelPermissionRuleExceptionCode.ROLE_NOT_FOUND,
        message: t`Role not found`,
        userFriendlyMessage: msg`Role not found`,
      });
    }

    const objectMetadata = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatRule.objectMetadataUniversalIdentifier,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    if (!isDefined(objectMetadata)) {
      errors.push({
        code: RowLevelPermissionRuleExceptionCode.OBJECT_METADATA_NOT_FOUND,
        message: t`Object metadata not found`,
        userFriendlyMessage: msg`Object metadata not found`,
      });
    }

    return errors;
  }
}
