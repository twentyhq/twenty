import { type Instruction } from 'expr-eval-fork';

import { type ExpressionTreeResult } from '@/types/ExpressionTreeResult';
import { buildExpressionNode } from '@/utils/expression/internal/buildExpressionNode';

const BRACKET_ACCESS_TOKEN = '[';

export const buildExpressionTree = (
  instructions: Instruction[],
): ExpressionTreeResult => {
  const result = buildExpressionNode({ instructions });

  if ('node' in result) {
    return { isValid: true, tree: result.node };
  }

  const { unexpectedToken } = result;

  if (unexpectedToken === BRACKET_ACCESS_TOKEN) {
    return {
      isValid: false,
      errorMessage: 'Bracket access is not supported, use dot access instead',
      errorCode: 'BRACKET_ACCESS',
    };
  }

  if (unexpectedToken === '') {
    return {
      isValid: false,
      errorMessage: 'Expression is incomplete',
      errorCode: 'INCOMPLETE_EXPRESSION',
    };
  }

  return {
    isValid: false,
    errorMessage: `Unexpected "${unexpectedToken}"`,
    errorCode: 'INVALID_SYNTAX',
    errorParams: { token: unexpectedToken },
  };
};
