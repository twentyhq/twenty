import { type ConditionalAvailabilityNode } from '@/conditional-availability/types/ConditionalAvailabilityNode';

export type ConditionalAvailabilityComparisonOperator = Extract<
  ConditionalAvailabilityNode,
  { type: 'COMPARISON' }
>['operator'];
