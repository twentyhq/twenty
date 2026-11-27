import { VALIDATION_RULE_PREVIOUS_VARIABLE_NAME } from '@/constants/ValidationRulePreviousVariableName';
import { type ExpressionFieldNode } from '@/expression/types/ExpressionFieldNode';
import { type ValidationRuleFieldDescriptor } from '@/types/ValidationRuleFieldDescriptor';
import { isDefined } from '@/utils/validation/isDefined';

// A field that no longer exists prints as an identifier no field can take, so the expression reports it as unknown
const toMissingFieldName = (universalIdentifier: string) =>
  `missingField_${universalIdentifier.replace(/[^\w]/g, '_')}`;

export const buildExpressionFieldPrinter = ({
  fields,
}: {
  fields: ValidationRuleFieldDescriptor[];
}): ((fieldNode: ExpressionFieldNode) => string) => {
  const fieldByUniversalIdentifier = new Map(
    fields.map((field) => [field.universalIdentifier, field]),
  );

  return ({
    fieldUniversalIdentifier,
    relationFieldUniversalIdentifier,
    subFieldName,
    isPreviousValue,
  }) => {
    const previousSegment = isPreviousValue
      ? VALIDATION_RULE_PREVIOUS_VARIABLE_NAME
      : undefined;

    if (!isDefined(relationFieldUniversalIdentifier)) {
      const field = fieldByUniversalIdentifier.get(fieldUniversalIdentifier);

      return [
        previousSegment,
        field?.name ?? toMissingFieldName(fieldUniversalIdentifier),
        subFieldName,
      ]
        .filter(isDefined)
        .join('.');
    }

    const relationField = fieldByUniversalIdentifier.get(
      relationFieldUniversalIdentifier,
    );
    const targetField = relationField?.relationTargetFields?.find(
      ({ universalIdentifier }) =>
        universalIdentifier === fieldUniversalIdentifier,
    );

    return [
      previousSegment,
      relationField?.name ??
        toMissingFieldName(relationFieldUniversalIdentifier),
      targetField?.name ?? toMissingFieldName(fieldUniversalIdentifier),
      subFieldName,
    ]
      .filter(isDefined)
      .join('.');
  };
};
