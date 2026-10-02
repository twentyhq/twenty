import { type Expression } from 'expr-eval-fork';

import { isDefined } from '@/utils/validation/isDefined';
import { validationRuleParser } from '@/utils/validation-rule/validationRuleParser';

const PARSED_EXPRESSION_CACHE_MAX_SIZE = 500;

const parsedExpressionBySource = new Map<string, Expression>();

export const parseValidationRuleExpression = (source: string): Expression => {
  const cachedExpression = parsedExpressionBySource.get(source);

  if (isDefined(cachedExpression)) {
    parsedExpressionBySource.delete(source);
    parsedExpressionBySource.set(source, cachedExpression);

    return cachedExpression;
  }

  const parsedExpression = validationRuleParser.parse(source);

  if (parsedExpressionBySource.size >= PARSED_EXPRESSION_CACHE_MAX_SIZE) {
    const leastRecentlyUsedSource = parsedExpressionBySource
      .keys()
      .next().value;

    if (isDefined(leastRecentlyUsedSource)) {
      parsedExpressionBySource.delete(leastRecentlyUsedSource);
    }
  }

  parsedExpressionBySource.set(source, parsedExpression);

  return parsedExpression;
};
