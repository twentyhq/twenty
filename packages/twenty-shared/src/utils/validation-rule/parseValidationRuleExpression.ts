import { type Expression } from 'expr-eval-fork';

import { isDefined } from '@/utils/validation/isDefined';
import { validationRuleParser } from '@/utils/validation-rule/validationRuleParser';

const parsedExpressionBySource = new Map<string, Expression>();

export const parseValidationRuleExpression = (source: string): Expression => {
  const cachedExpression = parsedExpressionBySource.get(source);

  if (isDefined(cachedExpression)) {
    return cachedExpression;
  }

  const parsedExpression = validationRuleParser.parse(source);

  parsedExpressionBySource.set(source, parsedExpression);

  return parsedExpression;
};
