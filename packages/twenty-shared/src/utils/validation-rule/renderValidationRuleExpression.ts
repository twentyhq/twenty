import { type ValidationRuleBindings } from '@/types/ValidationRuleBindings';
import { type ValidationRuleFieldDescriptor } from '@/types/ValidationRuleFieldDescriptor';
import { isValidationRuleFieldSymbol } from '@/utils/validation-rule/isValidationRuleFieldSymbol';
import { isValidationRuleReservedName } from '@/utils/validation-rule/isValidationRuleReservedName';
import { mapValidationRuleExpressionPaths } from '@/utils/validation-rule/mapValidationRuleExpressionPaths';
import { isDefined } from '@/utils/validation/isDefined';

const findBoundField = ({
  segment,
  candidateFields,
  bindings,
}: {
  segment: string | undefined;
  candidateFields: ValidationRuleFieldDescriptor[] | undefined;
  bindings: ValidationRuleBindings;
}): ValidationRuleFieldDescriptor | undefined => {
  if (!isDefined(segment) || !isValidationRuleFieldSymbol(segment)) {
    return undefined;
  }

  const boundUniversalIdentifier = bindings[segment];

  return candidateFields?.find(
    (candidate) => candidate.universalIdentifier === boundUniversalIdentifier,
  );
};

export const renderValidationRuleExpression = ({
  expression,
  bindings,
  fields,
}: {
  expression: string;
  bindings: ValidationRuleBindings;
  fields: ValidationRuleFieldDescriptor[];
}): string =>
  mapValidationRuleExpressionPaths({
    expression,
    mapPath: (path) => {
      const [rootSegment, memberSegment, ...remainingSegments] =
        path.split('.');

      const rootField = findBoundField({
        segment: rootSegment,
        candidateFields: fields,
        bindings,
      });
      const targetField = findBoundField({
        segment: memberSegment,
        candidateFields: rootField?.relationTargetFields,
        bindings,
      });

      return [
        isDefined(rootField) &&
        !isValidationRuleReservedName({ name: rootField.name, isMember: false })
          ? rootField.name
          : rootSegment,
        isDefined(targetField) &&
        !isValidationRuleReservedName({
          name: targetField.name,
          isMember: true,
        })
          ? targetField.name
          : memberSegment,
        ...remainingSegments,
      ]
        .filter(isDefined)
        .join('.');
    },
  });
