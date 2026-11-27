export interface ExpressionInNode<TNode> {
  type: 'IN';
  value: TNode;
  list: TNode;
}
