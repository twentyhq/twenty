import { type ConditionalEvaluationComparisonOperator } from '@/conditional-evaluation/common/types/ConditionalEvaluationComparisonOperator';

export const CONDITIONAL_EVALUATION_SYMBOL_BY_COMPARISON_OPERATOR = {
  EQUAL: '==',
  NOT_EQUAL: '!=',
  LESS_THAN: '<',
  LESS_THAN_OR_EQUAL: '<=',
  GREATER_THAN: '>',
  GREATER_THAN_OR_EQUAL: '>=',
} as const satisfies Record<ConditionalEvaluationComparisonOperator, string>;
