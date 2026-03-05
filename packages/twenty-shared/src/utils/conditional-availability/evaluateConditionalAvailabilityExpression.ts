import { isNonEmptyString } from '@sniptt/guards';
import { type EvaluationContext, Parser } from 'expr-eval';

import { isDefined } from '../validation/isDefined';

const parser = new Parser();

parser.functions.isDefined = (value: unknown) => isDefined(value);
parser.functions.isNonEmptyString = (value: unknown) => isNonEmptyString(value);
parser.functions.includes = (array: unknown, value: unknown) =>
  Array.isArray(array) && array.includes(value);

export const evaluateConditionalAvailabilityExpression = (
  expression: string | null | undefined,
  context: EvaluationContext,
): boolean => {
  if (!isNonEmptyString(expression)) {
    return true;
  }

  try {
    const parsed = parser.parse(expression);

    return parsed.evaluate(context) === true;
  } catch {
    return false;
  }
};
