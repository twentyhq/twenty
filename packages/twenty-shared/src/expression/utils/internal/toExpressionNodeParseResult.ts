import { type Instruction } from 'expr-eval-fork';

import { type ExpressionNodeParseResult } from '@/expression/types/ExpressionNodeParseResult';
import { buildExpressionNode } from '@/expression/utils/internal/buildExpressionNode';

const BRACKET_ACCESS_TOKEN = '[';

export const toExpressionNodeParseResult = (
  instructions: Instruction[],
): ExpressionNodeParseResult => {
  const result = buildExpressionNode({ instructions });

  if ('node' in result) {
    return { isValid: true, node: result.node };
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
