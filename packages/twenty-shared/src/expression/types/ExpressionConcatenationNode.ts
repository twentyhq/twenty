export interface ExpressionConcatenationNode<TNode> {
  type: 'CONCATENATION';
  left: TNode;
  right: TNode;
}
