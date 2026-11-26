// TODO(@neo773): remove once no rule is written as text anymore (stored widget rules are converted in 2.61; built-in rules and app manifests still send text)
import { type Instruction } from 'expr-eval-fork';

import { type ConditionalEvaluationNode } from '@/conditional-evaluation/common/types/ConditionalEvaluationNode';
import { EXPRESSION_SYMBOL_BY_ARITHMETIC_OPERATOR } from '@/expression/constants/ExpressionSymbolByArithmeticOperator';
import { EXPRESSION_SYMBOL_BY_UNARY_OPERATOR } from '@/expression/constants/ExpressionSymbolByUnaryOperator';
import { type ExpressionNode } from '@/expression/types/ExpressionNode';
import { buildExpressionNode } from '@/expression/utils/internal/buildExpressionNode';
import { getExpressionNodeChildren } from '@/expression/utils/internal/getExpressionNodeChildren';
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
    case 'FIELD':
      return node.fieldUniversalIdentifier;
    case 'CONCATENATION':
      return '||';
    case 'MEMBER':
      return `.${node.property}`;
    default:
      return getExpressionNodeChildren(node)
        .map(getComputationToken)
        .find(isDefined);
  }
};

const isConditionalEvaluationNode = (
  node: ExpressionNode,
): node is ConditionalEvaluationNode => !isDefined(getComputationToken(node));

export const toConditionalEvaluationNode = ({
  instructions,
}: {
  instructions: Instruction[];
}): { node: ConditionalEvaluationNode } | { unexpectedToken: string } => {
  const result = buildExpressionNode({ instructions });

  if (!('node' in result)) {
    return result;
  }

  const { node } = result;

  return isConditionalEvaluationNode(node)
    ? { node }
    : { unexpectedToken: getComputationToken(node) ?? '' };
};
