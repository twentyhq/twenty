import { VALIDATION_RULE_EMPTINESS_SUBFIELDS_BY_COMPOSITE_TYPE } from '@/constants/ValidationRuleEmptinessSubfieldsByCompositeType';
import { isDefined } from '@/utils/validation/isDefined';
import {
  validationRuleCompositeFieldTypeByValue,
  validationRuleNullPlaceholders,
} from '@/utils/validation-rule/validationRuleValueRegistry';

export const isValidationRuleValueEmpty = (value: unknown): boolean => {
  if (value === null || value === undefined || value === '') {
    return true;
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (typeof value !== 'object' || value instanceof Date) {
    return false;
  }

  if (validationRuleNullPlaceholders.has(value)) {
    return true;
  }

  const compositeFieldType = validationRuleCompositeFieldTypeByValue.get(value);

  const emptinessSubfields = isDefined(compositeFieldType)
    ? VALIDATION_RULE_EMPTINESS_SUBFIELDS_BY_COMPOSITE_TYPE[compositeFieldType]
    : undefined;

  const subfieldValues = isDefined(emptinessSubfields)
    ? emptinessSubfields.map(
        (subfieldName) => (value as Record<string, unknown>)[subfieldName],
      )
    : Object.values(value);

  return subfieldValues.every(isValidationRuleValueEmpty);
};
