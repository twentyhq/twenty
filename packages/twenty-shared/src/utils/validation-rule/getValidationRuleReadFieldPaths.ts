import { type ValidationRuleBindings } from '@/types/ValidationRuleBindings';
import { type ValidationRuleFieldDescriptor } from '@/types/ValidationRuleFieldDescriptor';
import { parseValidationRuleExpression } from '@/utils/validation-rule/parseValidationRuleExpression';
import { resolveValidationRuleIdentifierPath } from '@/utils/validation-rule/resolveValidationRuleIdentifierPath';
import { isDefined } from '@/utils/validation/isDefined';

export const getValidationRuleReadFieldPaths = ({
  expression,
  bindings,
  fields,
}: {
  expression: string;
  bindings: ValidationRuleBindings;
  fields: ValidationRuleFieldDescriptor[];
}): string[] => {
  let identifierPaths: string[];

  try {
    identifierPaths = parseValidationRuleExpression(expression).variables({
      withMembers: true,
    });
  } catch {
    return [];
  }

  const readFieldPaths = identifierPaths.flatMap((path) => {
    const resolution = resolveValidationRuleIdentifierPath({
      path,
      fields,
      bindings,
      acceptsFieldNames: false,
    });

    if (!resolution.isResolved || resolution.resolvedPath.type === 'now') {
      return [];
    }

    const { rootField, targetField } = resolution.resolvedPath;

    return [
      rootField.name,
      isDefined(targetField)
        ? `${rootField.name}.${targetField.name}`
        : undefined,
    ].filter(isDefined);
  });

  return [...new Set(readFieldPaths)];
};
