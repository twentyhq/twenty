import { Injectable } from '@nestjs/common';

import { msg, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined, parseValidationRuleExpression } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { ValidationRuleExceptionCode } from 'src/engine/metadata-modules/validation-rule/validation-rule.exception';
import { type UniversalFlatValidationRule } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-validation-rule.type';
import {
  type FailedFlatEntityValidation,
  type FlatEntityValidationError,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';
import { type FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { type UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';

type ValidationRuleRelatedMaps = UniversalFlatEntityValidationArgs<
  typeof ALL_METADATA_NAME.validationRule
>['optimisticFlatEntityMapsAndRelatedFlatEntityMaps'];

@Injectable()
export class FlatValidationRuleValidatorService {
  private collectValidationRuleErrors({
    universalFlatValidationRule,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    },
  }: {
    universalFlatValidationRule: UniversalFlatValidationRule;
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: ValidationRuleRelatedMaps;
  }): FlatEntityValidationError[] {
    const errors: FlatEntityValidationError[] = [];

    const flatObjectMetadata = findFlatEntityByUniversalIdentifier({
      universalIdentifier:
        universalFlatValidationRule.objectMetadataUniversalIdentifier,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    if (!isDefined(flatObjectMetadata)) {
      errors.push({
        code: ValidationRuleExceptionCode.INVALID_VALIDATION_RULE_INPUT,
        message: t`Validation rule object not found`,
        userFriendlyMessage: msg`Validation rule object not found`,
      });
    } else if (flatObjectMetadata.isSystem) {
      errors.push({
        code: ValidationRuleExceptionCode.INVALID_VALIDATION_RULE_INPUT,
        message: t`Validation rules cannot be added to system objects`,
        userFriendlyMessage: msg`Validation rules cannot be added to system objects`,
      });
    }

    const errorFieldMetadataUniversalIdentifier =
      universalFlatValidationRule.errorFieldMetadataUniversalIdentifier;

    if (isDefined(errorFieldMetadataUniversalIdentifier)) {
      const errorFlatFieldMetadata = findFlatEntityByUniversalIdentifier({
        universalIdentifier: errorFieldMetadataUniversalIdentifier,
        flatEntityMaps: flatFieldMetadataMaps,
      });

      if (
        !isDefined(errorFlatFieldMetadata) ||
        errorFlatFieldMetadata.objectMetadataUniversalIdentifier !==
          universalFlatValidationRule.objectMetadataUniversalIdentifier
      ) {
        errors.push({
          code: ValidationRuleExceptionCode.INVALID_VALIDATION_RULE_INPUT,
          message: t`Validation rule error field must belong to the rule's object`,
          userFriendlyMessage: msg`Validation rule error field must belong to the rule's object`,
        });
      }
    }

    if (!isNonEmptyString(universalFlatValidationRule.message.trim())) {
      errors.push({
        code: ValidationRuleExceptionCode.INVALID_VALIDATION_RULE_INPUT,
        message: t`Validation rule message is required`,
        userFriendlyMessage: msg`Validation rule message is required`,
      });
    }

    try {
      parseValidationRuleExpression(universalFlatValidationRule.expression);
    } catch {
      errors.push({
        code: ValidationRuleExceptionCode.INVALID_VALIDATION_RULE_EXPRESSION,
        message: t`Validation rule expression cannot be parsed`,
        userFriendlyMessage: msg`Validation rule expression cannot be parsed`,
      });
    }

    return errors;
  }

  public validateFlatValidationRuleCreation({
    flatEntityToValidate: universalFlatValidationRule,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.validationRule
  >): FailedFlatEntityValidation<'validationRule', 'create'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: universalFlatValidationRule.universalIdentifier,
      },
      metadataName: 'validationRule',
      type: 'create',
    });

    validationResult.errors.push(
      ...this.collectValidationRuleErrors({
        universalFlatValidationRule,
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
      }),
    );

    return validationResult;
  }

  public validateFlatValidationRuleDeletion({
    flatEntityToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatValidationRuleMaps: optimisticFlatValidationRuleMaps,
    },
  }: UniversalFlatEntityValidationArgs<
    typeof ALL_METADATA_NAME.validationRule
  >): FailedFlatEntityValidation<'validationRule', 'delete'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: flatEntityToValidate.universalIdentifier,
      },
      metadataName: 'validationRule',
      type: 'delete',
    });

    const existingValidationRule = findFlatEntityByUniversalIdentifier({
      universalIdentifier: flatEntityToValidate.universalIdentifier,
      flatEntityMaps: optimisticFlatValidationRuleMaps,
    });

    if (!isDefined(existingValidationRule)) {
      validationResult.errors.push({
        code: ValidationRuleExceptionCode.VALIDATION_RULE_NOT_FOUND,
        message: t`Validation rule not found`,
        userFriendlyMessage: msg`Validation rule not found`,
      });
    }

    return validationResult;
  }

  public validateFlatValidationRuleUpdate({
    universalIdentifier,
    flatEntityUpdate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
  }: FlatEntityUpdateValidationArgs<
    typeof ALL_METADATA_NAME.validationRule
  >): FailedFlatEntityValidation<'validationRule', 'update'> {
    const validationResult = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier,
      },
      metadataName: 'validationRule',
      type: 'update',
    });

    const fromUniversalFlatValidationRule = findFlatEntityByUniversalIdentifier(
      {
        universalIdentifier,
        flatEntityMaps:
          optimisticFlatEntityMapsAndRelatedFlatEntityMaps.flatValidationRuleMaps,
      },
    );

    if (!isDefined(fromUniversalFlatValidationRule)) {
      validationResult.errors.push({
        code: ValidationRuleExceptionCode.VALIDATION_RULE_NOT_FOUND,
        message: t`Validation rule not found`,
        userFriendlyMessage: msg`Validation rule not found`,
      });

      return validationResult;
    }

    validationResult.errors.push(
      ...this.collectValidationRuleErrors({
        universalFlatValidationRule: {
          ...fromUniversalFlatValidationRule,
          ...flatEntityUpdate,
        },
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
      }),
    );

    return validationResult;
  }
}
