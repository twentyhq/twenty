import { VALIDATION_RULE_EMPTINESS_SUBFIELDS_BY_COMPOSITE_TYPE } from '@/constants/ValidationRuleEmptinessSubfieldsByCompositeType';
import { FieldMetadataType } from '@/types/FieldMetadataType';
import { isNonEmptyString } from '@/utils/typeguard/isNonEmptyString';
import { isPlainObject } from '@/utils/typeguard/isPlainObject';
import { isDefined } from '@/utils/validation/isDefined';
import {
  validationRuleCompositeFieldTypeByValue,
  validationRuleNullPlaceholders,
} from '@/utils/validation-rule/validationRuleValueRegistry';

export const isValidationRuleValueEmpty = (value: unknown): boolean => {
  if (!isDefined(value) || value === '') {
    return true;
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (!isPlainObject(value) || value instanceof Date) {
    return false;
  }

  if (validationRuleNullPlaceholders.has(value)) {
    return true;
  }

  const compositeFieldType = validationRuleCompositeFieldTypeByValue.get(value);

  if (compositeFieldType === FieldMetadataType.RICH_TEXT) {
    return (
      !isNonEmptyString(value.markdown) || value.markdown.trim().length === 0
    );
  }

  const emptinessSubfields = isDefined(compositeFieldType)
    ? VALIDATION_RULE_EMPTINESS_SUBFIELDS_BY_COMPOSITE_TYPE[compositeFieldType]
    : undefined;

  const subfieldValues = isDefined(emptinessSubfields)
    ? emptinessSubfields.map((subfieldName) => value[subfieldName])
    : Object.values(value);

  return subfieldValues.every(isValidationRuleValueEmpty);
};
