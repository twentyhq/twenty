export interface ExpressionNotNode<TNode> {
  type: 'NOT';
  child: TNode;
}
