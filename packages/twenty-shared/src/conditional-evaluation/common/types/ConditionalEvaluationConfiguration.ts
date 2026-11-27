import { type CONDITIONAL_EVALUATION_FUNCTIONS } from '@/conditional-evaluation/common/constants/ConditionalEvaluationFunctions';
import { type ExpressionComparisonOperator } from '@/expression/types/ExpressionComparisonOperator';

export type ConditionalEvaluationConfiguration = {
  variables: Record<string, true>;
  functions: Partial<typeof CONDITIONAL_EVALUATION_FUNCTIONS>;
  comparisonOperators: readonly ExpressionComparisonOperator[];
};
