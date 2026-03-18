import { type Nullable } from '@/types';

import { capitalize } from '../strings/capitalize';
import { isDefined } from '../validation/isDefined';

import { safeGetNestedProperty } from './safeGetNestedProperty';

const TEMPLATE_VARIABLE_REGEX = /\$\{([^{}]+)\}/g;
const HAS_TEMPLATE_VARIABLE_REGEX = /\$\{[^{}]+\}/;
const TRANSFORM_FUNCTION_CALL_REGEX = /^(\w+)\((.+)\)$/;

const LABEL_TRANSFORM_FUNCTIONS: Record<string, (value: string) => string> = {
  capitalize,
  lowercase: (value: string) => value.toLowerCase(),
};

const resolveTemplateExpression = ({
  expression,
  context,
}: {
  expression: string;
  context: Record<string, unknown>;
}): string => {
  const trimmedExpression = expression.trim();
  const transformFunctionMatch = trimmedExpression.match(
    TRANSFORM_FUNCTION_CALL_REGEX,
  );

  const expressionToEvaluate = transformFunctionMatch
    ? transformFunctionMatch[2].trim()
    : trimmedExpression;

  const transformFunction = transformFunctionMatch
    ? LABEL_TRANSFORM_FUNCTIONS[transformFunctionMatch[1]]
    : undefined;

  const resolvedPropertyValue = safeGetNestedProperty(
    context,
    expressionToEvaluate,
  );

  if (!isDefined(resolvedPropertyValue)) {
    return '';
  }

  const stringValue = String(resolvedPropertyValue);

  return isDefined(transformFunction)
    ? transformFunction(stringValue)
    : stringValue;
};

export const interpolateCommandMenuItemLabel = ({
  label,
  context,
}: {
  label: Nullable<string>;
  context: Record<string, unknown>;
}): Nullable<string> => {
  if (!isDefined(label)) {
    return null;
  }

  if (!HAS_TEMPLATE_VARIABLE_REGEX.test(label)) {
    return label;
  }

  return label.replace(TEMPLATE_VARIABLE_REGEX, (match, expression: string) => {
    try {
      return resolveTemplateExpression({ expression, context });
    } catch {
      return match;
    }
  });
};
