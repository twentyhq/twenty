import { type ExpressionLogicalOperator } from '@/expression/types/ExpressionLogicalOperator';

export interface ExpressionGroupNode<TNode> {
  type: 'GROUP';
  logicalOperator: ExpressionLogicalOperator;
  children: TNode[];
}
