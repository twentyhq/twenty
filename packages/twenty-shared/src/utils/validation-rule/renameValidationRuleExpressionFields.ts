import { type ValidationRuleBindings } from '@/types/ValidationRuleBindings';
import { type ValidationRuleFieldDescriptor } from '@/types/ValidationRuleFieldDescriptor';
import { isDefined } from '@/utils/validation/isDefined';
import { tokenizeValidationRuleExpression } from '@/utils/validation-rule/tokenizeValidationRuleExpression';

// Each bound prefix (company, company.employees, previous.company.employees) names one field
export const renameValidationRulePath = ({
  path,
  bindings,
  fieldNameByUniversalIdentifier,
}: {
  path: string;
  bindings: ValidationRuleBindings;
  fieldNameByUniversalIdentifier: Map<string, string>;
}): string => {
  const segments = path.split('.');

  return segments
    .map((segment, index) => {
      const boundUniversalIdentifier =
        bindings[segments.slice(0, index + 1).join('.')];

      return (
        (isDefined(boundUniversalIdentifier)
          ? fieldNameByUniversalIdentifier.get(boundUniversalIdentifier)
          : undefined) ?? segment
      );
    })
    .join('.');
};

export const renameValidationRuleExpressionFields = ({
  expression,
  bindings,
  fieldNameByUniversalIdentifier,
}: {
  expression: string;
  bindings: ValidationRuleBindings;
  fieldNameByUniversalIdentifier: Map<string, string>;
}): string =>
  tokenizeValidationRuleExpression(expression)
    .map((token) =>
      token.type === 'path'
        ? renameValidationRulePath({
            path: token.text,
            bindings,
            fieldNameByUniversalIdentifier,
          })
        : token.text,
    )
    .join('');

const collectFieldNames = (
  fields: ValidationRuleFieldDescriptor[],
): [string, string][] =>
  fields.flatMap((field) => [
    [field.universalIdentifier, field.name] as [string, string],
    ...collectFieldNames(field.relationTargetFields ?? []),
  ]);

// Stored bindings keep a condition on its fields when they are renamed after it was written
export const renameValidationRuleExpressionToCurrentFieldNames = ({
  expression,
  bindings,
  fields,
}: {
  expression: string;
  bindings: ValidationRuleBindings;
  fields: ValidationRuleFieldDescriptor[];
}): string =>
  renameValidationRuleExpressionFields({
    expression,
    bindings,
    fieldNameByUniversalIdentifier: new Map(collectFieldNames(fields)),
  });
