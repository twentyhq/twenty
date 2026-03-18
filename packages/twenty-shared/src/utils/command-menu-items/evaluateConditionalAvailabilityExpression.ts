import { isNonEmptyString } from '@sniptt/guards';
import { type EvaluationContext } from 'expr-eval-fork';

import { conditionalAvailabilityParser } from './conditionalAvailabilityParser';

export const evaluateConditionalAvailabilityExpression = (
  expression: string | null | undefined,
  context: EvaluationContext,
): boolean => {
  if (!isNonEmptyString(expression)) {
    return true;
  }

  try {
    const parsed = conditionalAvailabilityParser.parse(expression);

    return parsed.evaluate(context) === true;
  } catch {
    return false;
  }
};
