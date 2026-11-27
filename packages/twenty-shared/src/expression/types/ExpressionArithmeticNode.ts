import { type ExpressionArithmeticOperator } from '@/expression/types/ExpressionArithmeticOperator';

export interface ExpressionArithmeticNode<TNode> {
  type: 'ARITHMETIC';
  operator: ExpressionArithmeticOperator;
  left: TNode;
  right: TNode;
}
