import { msg, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type ObjectValidationRule } from 'twenty-shared/types';
import { parseValidationRuleExpression } from 'twenty-shared/utils';

import { ValidationRuleExceptionCode } from 'src/engine/metadata-modules/validation-rule/validation-rule.exception';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

export const validateFlatObjectMetadataValidationRules = (
  validationRules: ObjectValidationRule[],
): FlatEntityValidationError[] => {
  const errors: FlatEntityValidationError[] = [];

  const ruleIds = validationRules.map((validationRule) => validationRule.id);

  if (new Set(ruleIds).size !== ruleIds.length) {
    errors.push({
      code: ValidationRuleExceptionCode.INVALID_VALIDATION_RULE_INPUT,
      message: t`Validation rule ids must be unique`,
      userFriendlyMessage: msg`Validation rule ids must be unique`,
    });
  }

  for (const validationRule of validationRules) {
    if (!isNonEmptyString(validationRule.message.trim())) {
      errors.push({
        code: ValidationRuleExceptionCode.INVALID_VALIDATION_RULE_INPUT,
        message: t`Validation rule message is required`,
        userFriendlyMessage: msg`Validation rule message is required`,
      });
    }

    try {
      parseValidationRuleExpression(validationRule.expression);
    } catch {
      errors.push({
        code: ValidationRuleExceptionCode.INVALID_VALIDATION_RULE_EXPRESSION,
        message: t`Validation rule expression cannot be parsed`,
        userFriendlyMessage: msg`Validation rule expression cannot be parsed`,
      });
    }
  }

  return errors;
};
