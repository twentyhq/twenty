// TODO(@neo773): remove once no rule is written as text anymore (stored widget rules are converted in 2.61; built-in rules and app manifests still send text)
import { type Instruction } from 'expr-eval-fork';

import { type ConditionalAvailabilityNode } from '@/conditional-availability/types/ConditionalAvailabilityNode';
import { EXPRESSION_SYMBOL_BY_ARITHMETIC_OPERATOR } from '@/constants/ExpressionSymbolByArithmeticOperator';
import { EXPRESSION_SYMBOL_BY_UNARY_OPERATOR } from '@/constants/ExpressionSymbolByUnaryOperator';
import { type ExpressionNode } from '@/types/ExpressionNode';
import { buildExpressionNode } from '@/utils/expression/internal/buildExpressionNode';
import { getExpressionNodeChildren } from '@/utils/expression/internal/getExpressionNodeChildren';
import { isDefined } from '@/utils/validation/isDefined';

const getComputationToken = (node: ExpressionNode): string | undefined => {
  switch (node.type) {
    case 'ARITHMETIC':
      return EXPRESSION_SYMBOL_BY_ARITHMETIC_OPERATOR[node.operator];
    case 'UNARY':
      return EXPRESSION_SYMBOL_BY_UNARY_OPERATOR[node.operator];
    case 'LIST':
      return '[';
    case 'IN':
      return 'in';
    default:
      return getExpressionNodeChildren(node)
        .map(getComputationToken)
        .find(isDefined);
  }
};

const isConditionalAvailabilityNode = (
  node: ExpressionNode,
): node is ConditionalAvailabilityNode => !isDefined(getComputationToken(node));

export const toConditionalAvailabilityNode = ({
  instructions,
}: {
  instructions: Instruction[];
}): { node: ConditionalAvailabilityNode } | { unexpectedToken: string } => {
  const result = buildExpressionNode({ instructions });

  if (!('node' in result)) {
    return result;
  }

  const { node } = result;

  return isConditionalAvailabilityNode(node)
    ? { node }
    : { unexpectedToken: getComputationToken(node) ?? '' };
};
