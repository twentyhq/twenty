import { type FlatValidationRule } from 'src/engine/metadata-modules/flat-validation-rule/types/flat-validation-rule.type';
import { type ValidationRuleDTO } from 'src/engine/metadata-modules/validation-rule/dtos/validation-rule.dto';

export const fromFlatValidationRuleToValidationRuleDto = (
  flatValidationRule: FlatValidationRule,
): ValidationRuleDTO => ({
  id: flatValidationRule.id,
  objectMetadataId: flatValidationRule.objectMetadataId,
  errorFieldMetadataId: flatValidationRule.errorFieldMetadataId,
  expression: flatValidationRule.expression,
  message: flatValidationRule.message,
  isActive: flatValidationRule.isActive,
  workspaceId: flatValidationRule.workspaceId,
  applicationId: flatValidationRule.applicationId,
  createdAt: new Date(flatValidationRule.createdAt),
  updatedAt: new Date(flatValidationRule.updatedAt),
});
