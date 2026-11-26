export interface ExpressionMemberNode<TNode> {
  type: 'MEMBER';
  object: TNode;
  property: string;
}
