/* @license Enterprise */

import { type ExpressionNode } from 'twenty-shared/expression';
import { type ValidationRuleFieldDescriptor } from 'twenty-shared/types';
import {
  compileValidationRuleExpression,
  parseExpressionNode,
  resolveExpressionFieldReferences,
} from 'twenty-shared/utils';

export const compileValidationRuleTree = ({
  expression,
  fields,
  isParseOnly = false,
}: {
  expression: string;
  fields: ValidationRuleFieldDescriptor[];
  isParseOnly?: boolean;
}):
  | { isValid: true; tree: ExpressionNode }
  | { isValid: false; errorMessage: string } => {
  if (!isParseOnly) {
    const compilation = compileValidationRuleExpression({ expression, fields });

    if (!compilation.isValid) {
      return { isValid: false, errorMessage: compilation.errorMessage };
    }
  }

  const parsing = parseExpressionNode(expression);

  if (!parsing.isValid) {
    return { isValid: false, errorMessage: parsing.errorMessage };
  }

  return {
    isValid: true,
    tree: resolveExpressionFieldReferences({ node: parsing.node, fields }),
  };
};
