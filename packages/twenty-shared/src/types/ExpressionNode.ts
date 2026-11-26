import { type ConditionalEvaluationComparisonOperator } from '@/conditional-evaluation/common/types/ConditionalEvaluationComparisonOperator';
import { type ConditionalEvaluationLogicalOperator } from '@/conditional-evaluation/common/types/ConditionalEvaluationLogicalOperator';
import { type ExpressionArithmeticOperator } from './ExpressionArithmeticOperator';
import { type ExpressionUnaryOperator } from './ExpressionUnaryOperator';

// The conditional evaluation tree, widened with what formulas and validation rules compute
export type ExpressionNode =
  | { type: 'LITERAL'; value: string | number | boolean }
  | { type: 'VARIABLE'; path: string }
  | {
      type: 'COMPARISON';
      operator: ConditionalEvaluationComparisonOperator;
      left: ExpressionNode;
      right: ExpressionNode;
    }
  | {
      type: 'GROUP';
      logicalOperator: ConditionalEvaluationLogicalOperator;
      children: ExpressionNode[];
    }
  | { type: 'NOT'; child: ExpressionNode }
  | {
      type: 'FUNCTION_CALL';
      functionName: string;
      arguments: ExpressionNode[];
    }
  | {
      type: 'ARITHMETIC';
      operator: ExpressionArithmeticOperator;
      left: ExpressionNode;
      right: ExpressionNode;
    }
  | {
      type: 'UNARY';
      operator: ExpressionUnaryOperator;
      operand: ExpressionNode;
    }
  | { type: 'LIST'; items: ExpressionNode[] }
  | { type: 'IN'; value: ExpressionNode; list: ExpressionNode };
