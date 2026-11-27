import { type ExpressionComparisonOperator } from '@/expression/types/ExpressionComparisonOperator';

export interface ExpressionComparisonNode<TNode> {
  type: 'COMPARISON';
  operator: ExpressionComparisonOperator;
  left: TNode;
  right: TNode;
}
