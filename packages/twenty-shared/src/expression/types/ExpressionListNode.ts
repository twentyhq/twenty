export interface ExpressionListNode<TNode> {
  type: 'LIST';
  items: TNode[];
}
