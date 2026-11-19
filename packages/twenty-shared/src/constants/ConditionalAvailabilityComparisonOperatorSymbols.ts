import { type ConditionalAvailabilityComparisonOperator } from '@/types/ConditionalAvailabilityComparisonOperator';

export const CONDITIONAL_AVAILABILITY_COMPARISON_OPERATOR_SYMBOLS = {
  EQUAL: '==',
  NOT_EQUAL: '!=',
  LESS_THAN: '<',
  LESS_THAN_OR_EQUAL: '<=',
  GREATER_THAN: '>',
  GREATER_THAN_OR_EQUAL: '>=',
} as const satisfies Record<ConditionalAvailabilityComparisonOperator, string>;
