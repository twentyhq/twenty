/* @license Enterprise */

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatValidationRule } from 'src/engine/metadata-modules/flat-validation-rule/types/flat-validation-rule.type';
import { type ValidationRuleDTO } from 'src/engine/metadata-modules/validation-rule/dtos/validation-rule.dto';
import { printFlatValidationRuleExpression } from 'src/engine/metadata-modules/validation-rule/utils/print-flat-validation-rule-expression.util';

export const fromFlatValidationRuleToValidationRuleDto = ({
  flatValidationRule,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  flatValidationRule: FlatValidationRule;
} & Pick<
  AllFlatEntityMaps,
  'flatObjectMetadataMaps' | 'flatFieldMetadataMaps'
>): ValidationRuleDTO => ({
  id: flatValidationRule.id,
  objectMetadataId: flatValidationRule.objectMetadataId,
  name: flatValidationRule.name,
  description: flatValidationRule.description,
  icon: flatValidationRule.icon,
  errorFieldMetadataId: flatValidationRule.errorFieldMetadataId,
  expression: printFlatValidationRuleExpression({
    flatValidationRule,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  }),
  message: flatValidationRule.message,
  isActive: flatValidationRule.isActive,
});
