// TODO(@neo773): remove once command menu items use the rule tree
import { isNonEmptyString } from '@sniptt/guards';
import { type EvaluationContext } from 'expr-eval-fork';

import { conditionalEvaluationParser } from '@/conditional-evaluation/expression-to-nodes/utils/conditionalEvaluationParser';

export const evaluateConditionalEvaluationExpression = (
  expression: string | null | undefined,
  context: EvaluationContext,
): boolean => {
  if (!isNonEmptyString(expression)) {
    return true;
  }

  try {
    const parsed = conditionalEvaluationParser.parse(expression);

    return parsed.evaluate(context) === true;
  } catch {
    return false;
  }
};
