import { type FlatValidationRule } from 'src/engine/metadata-modules/flat-validation-rule/types/flat-validation-rule.type';
import { type ValidationRuleDTO } from 'src/engine/metadata-modules/validation-rule/dtos/validation-rule.dto';

export const fromFlatValidationRuleToValidationRuleDto = (
  flatValidationRule: FlatValidationRule,
): ValidationRuleDTO => ({
  id: flatValidationRule.id,
  objectMetadataId: flatValidationRule.objectMetadataId,
  name: flatValidationRule.name,
  description: flatValidationRule.description,
  icon: flatValidationRule.icon,
  errorFieldMetadataId: flatValidationRule.errorFieldMetadataId,
  expression: flatValidationRule.expression,
  bindings: flatValidationRule.bindings,
  message: flatValidationRule.message,
  isActive: flatValidationRule.isActive,
});
