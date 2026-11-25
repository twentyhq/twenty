import { type ExpressionTreeResult } from '@/types/ExpressionTreeResult';
import { buildExpressionTree } from '@/utils/expression/internal/buildExpressionTree';
import { getExpressionSyntaxError } from '@/utils/expression/getExpressionSyntaxError';
import { parseValidationRuleExpression } from '@/utils/validation-rule/parseValidationRuleExpression';

export const parseExpressionTree = (
  expression: string,
): ExpressionTreeResult => {
  try {
    return buildExpressionTree(
      parseValidationRuleExpression(expression).tokens,
    );
  } catch (error) {
    return {
      isValid: false,
      ...getExpressionSyntaxError({ expression, error }),
    };
  }
};
