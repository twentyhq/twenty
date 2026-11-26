import { type ConditionalEvaluationNode } from '@/conditional-evaluation/common/types/ConditionalEvaluationNode';
import { printExpressionNode } from '@/expression/utils/printExpressionNode';

export const printConditionalEvaluationNode = ({
  node,
}: {
  node: ConditionalEvaluationNode;
}): string => printExpressionNode({ node });
