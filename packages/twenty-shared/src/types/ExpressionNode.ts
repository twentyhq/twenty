export type ExpressionNode =
  | { kind: 'literal'; value: string | number | boolean }
  | { kind: 'path'; path: string }
  | { kind: 'list'; items: ExpressionNode[] }
  | { kind: 'unary'; operator: string; operand: ExpressionNode }
  | {
      kind: 'binary';
      operator: string;
      left: ExpressionNode;
      right: ExpressionNode;
    }
  | { kind: 'call'; functionName: string; arguments: ExpressionNode[] };
