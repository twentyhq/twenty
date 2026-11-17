import { type ValidationRuleBindings } from '@/types/ValidationRuleBindings';
import { type ValidationRuleFieldDescriptor } from '@/types/ValidationRuleFieldDescriptor';
import { renameValidationRuleExpressionFields } from '@/utils/validation-rule/renameValidationRuleExpressionFields';

const collectFieldNames = (
  fields: ValidationRuleFieldDescriptor[],
): [string, string][] =>
  fields.flatMap((field): [string, string][] => [
    [field.universalIdentifier, field.name],
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
