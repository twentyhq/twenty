import { type ObjectValidationRule } from 'twenty-shared/types';

import { type ValidationRuleDTO } from 'src/engine/metadata-modules/validation-rule/dtos/validation-rule.dto';

export const fromObjectValidationRuleToValidationRuleDto = ({
  objectMetadataId,
  validationRule,
}: {
  objectMetadataId: string;
  validationRule: ObjectValidationRule;
}): ValidationRuleDTO => ({
  id: validationRule.id,
  objectMetadataId,
  errorFieldMetadataId: validationRule.errorFieldMetadataId,
  expression: validationRule.expression,
  message: validationRule.message,
  isActive: validationRule.isActive,
});
