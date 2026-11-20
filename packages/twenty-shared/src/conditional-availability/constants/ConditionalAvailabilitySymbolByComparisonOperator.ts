import { type ConditionalAvailabilityComparisonOperator } from '@/conditional-availability/types/ConditionalAvailabilityComparisonOperator';

export const CONDITIONAL_AVAILABILITY_SYMBOL_BY_COMPARISON_OPERATOR = {
  EQUAL: '==',
  NOT_EQUAL: '!=',
  LESS_THAN: '<',
  LESS_THAN_OR_EQUAL: '<=',
  GREATER_THAN: '>',
  GREATER_THAN_OR_EQUAL: '>=',
} as const satisfies Record<ConditionalAvailabilityComparisonOperator, string>;
