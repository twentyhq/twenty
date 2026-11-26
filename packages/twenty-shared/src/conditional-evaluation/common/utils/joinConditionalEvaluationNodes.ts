import { type ExpressionLogicalOperator } from '@/expression/types/ExpressionLogicalOperator';
import { type ConditionalEvaluationNode } from '@/conditional-evaluation/common/types/ConditionalEvaluationNode';
import { isDefined } from '@/utils/validation/isDefined';

export const joinConditionalEvaluationNodes = ({
  nodes,
  logicalOperator,
}: {
  nodes: ConditionalEvaluationNode[];
  logicalOperator: ExpressionLogicalOperator;
}): ConditionalEvaluationNode => {
  const [onlyNode] = nodes;

  if (nodes.length === 1 && isDefined(onlyNode)) {
    return onlyNode;
  }

  return {
    type: 'GROUP',
    logicalOperator,
    children: nodes.flatMap((node) =>
      node.type === 'GROUP' && node.logicalOperator === logicalOperator
        ? node.children
        : [node],
    ),
  };
};
