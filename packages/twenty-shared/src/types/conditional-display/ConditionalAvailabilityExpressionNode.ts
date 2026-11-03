export type ConditionalAvailabilityExpressionNode =
  | { kind: 'literal'; value: string | number | boolean }
  | { kind: 'variable'; name: string }
  | { kind: 'list'; elements: ConditionalAvailabilityExpressionNode[] }
  | {
      kind: 'member';
      object: ConditionalAvailabilityExpressionNode;
      memberName: string;
    }
  | { kind: 'not'; operand: ConditionalAvailabilityExpressionNode }
  | {
      kind: 'logicalOperation';
      operator: 'and' | 'or';
      left: ConditionalAvailabilityExpressionNode;
      right: ConditionalAvailabilityExpressionNode;
    }
  | {
      kind: 'comparison';
      operator: '==' | '!=' | '<' | '<=' | '>' | '>=';
      left: ConditionalAvailabilityExpressionNode;
      right: ConditionalAvailabilityExpressionNode;
    }
  | {
      kind: 'functionCall';
      functionName: string;
      functionArguments: ConditionalAvailabilityExpressionNode[];
    };
