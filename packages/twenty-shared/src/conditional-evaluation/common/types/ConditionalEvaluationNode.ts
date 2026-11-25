import { type ConditionalEvaluationComparisonOperator } from '@/conditional-evaluation/common/types/ConditionalEvaluationComparisonOperator';
import { type ConditionalEvaluationLogicalOperator } from '@/conditional-evaluation/common/types/ConditionalEvaluationLogicalOperator';

export type ConditionalEvaluationNode =
  | { type: 'LITERAL'; value: string | number | boolean }
  | { type: 'VARIABLE'; path: string }
  | {
      type: 'COMPARISON';
      operator: ConditionalEvaluationComparisonOperator;
      left: ConditionalEvaluationNode;
      right: ConditionalEvaluationNode;
    }
  | {
      type: 'GROUP';
      logicalOperator: ConditionalEvaluationLogicalOperator;
      children: ConditionalEvaluationNode[];
    }
  | { type: 'NOT'; child: ConditionalEvaluationNode }
  | {
      type: 'FUNCTION_CALL';
      functionName: string;
      arguments: ConditionalEvaluationNode[];
    };
