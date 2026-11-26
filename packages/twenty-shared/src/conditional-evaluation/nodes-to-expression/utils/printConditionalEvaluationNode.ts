import { type ConditionalEvaluationNode } from '@/conditional-evaluation/common/types/ConditionalEvaluationNode';
import { printExpressionNode } from '@/utils/expression/printExpressionNode';

export const printConditionalEvaluationNode = ({
  node,
}: {
  node: ConditionalEvaluationNode;
}): string => printExpressionNode({ node });
