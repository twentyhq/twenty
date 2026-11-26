import { type ExpressionNodeParseResult } from '@/expression/types/ExpressionNodeParseResult';
import { toExpressionNodeParseResult } from '@/expression/utils/internal/toExpressionNodeParseResult';
import { getExpressionSyntaxError } from '@/utils/expression/getExpressionSyntaxError';
import { parseValidationRuleExpression } from '@/utils/validation-rule/parseValidationRuleExpression';

export const parseExpressionNode = (
  expression: string,
): ExpressionNodeParseResult => {
  try {
    return toExpressionNodeParseResult(
      parseValidationRuleExpression(expression).tokens,
    );
  } catch (error) {
    return {
      isValid: false,
      ...getExpressionSyntaxError({ expression, error }),
    };
  }
};
