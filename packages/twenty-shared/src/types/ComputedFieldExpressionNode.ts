import { type ComputedFieldExpressionBinaryOperator } from '@/types/ComputedFieldExpressionBinaryOperator';
import { type ComputedFieldExpressionUnaryOperator } from '@/types/ComputedFieldExpressionUnaryOperator';
import { type ComputedFieldExpressionVariableName } from '@/types/ComputedFieldExpressionVariableName';

// A list is only valid as the right operand of "in"
export type ComputedFieldExpressionNode<
  TAnnotation = unknown,
  TFunctionName extends string = string,
> = (
  | { kind: 'textLiteral'; value: string }
  | { kind: 'numberLiteral'; value: number }
  | { kind: 'booleanLiteral'; value: boolean }
  | { kind: 'fieldPath'; path: string[] }
  | { kind: 'variable'; name: ComputedFieldExpressionVariableName }
  | {
      kind: 'unaryOperation';
      operator: ComputedFieldExpressionUnaryOperator;
      operand: ComputedFieldExpressionNode<TAnnotation, TFunctionName>;
    }
  | {
      kind: 'binaryOperation';
      operator: ComputedFieldExpressionBinaryOperator;
      left: ComputedFieldExpressionNode<TAnnotation, TFunctionName>;
      right: ComputedFieldExpressionNode<TAnnotation, TFunctionName>;
    }
  | {
      kind: 'conditional';
      condition: ComputedFieldExpressionNode<TAnnotation, TFunctionName>;
      whenTrue: ComputedFieldExpressionNode<TAnnotation, TFunctionName>;
      whenFalse: ComputedFieldExpressionNode<TAnnotation, TFunctionName>;
    }
  | {
      kind: 'functionCall';
      name: TFunctionName;
      functionArguments: ComputedFieldExpressionNode<
        TAnnotation,
        TFunctionName
      >[];
    }
  | {
      kind: 'list';
      items: ComputedFieldExpressionNode<TAnnotation, TFunctionName>[];
    }
) &
  TAnnotation;
