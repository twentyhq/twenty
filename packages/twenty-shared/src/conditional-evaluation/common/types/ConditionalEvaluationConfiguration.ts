import { type CONDITIONAL_EVALUATION_FUNCTIONS } from '@/conditional-evaluation/common/constants/ConditionalEvaluationFunctions';
import { type ConditionalEvaluationComparisonOperator } from '@/conditional-evaluation/common/types/ConditionalEvaluationComparisonOperator';

export type ConditionalEvaluationConfiguration = {
  variables: Record<string, true>;
  functions: Partial<typeof CONDITIONAL_EVALUATION_FUNCTIONS>;
  comparisonOperators: readonly ConditionalEvaluationComparisonOperator[];
};
