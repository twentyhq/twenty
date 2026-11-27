import { type ExpressionUnaryOperator } from '@/expression/types/ExpressionUnaryOperator';

export interface ExpressionUnaryNode<TNode> {
  type: 'UNARY';
  operator: ExpressionUnaryOperator;
  operand: TNode;
}
