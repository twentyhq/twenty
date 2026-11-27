export interface ExpressionFunctionCallNode<TNode> {
  type: 'FUNCTION_CALL';
  functionName: string;
  arguments: TNode[];
}
