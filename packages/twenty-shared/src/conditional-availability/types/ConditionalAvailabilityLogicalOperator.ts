import { type ConditionalAvailabilityNode } from '@/conditional-availability/types/ConditionalAvailabilityNode';

export type ConditionalAvailabilityLogicalOperator = Extract<
  ConditionalAvailabilityNode,
  { type: 'GROUP' }
>['logicalOperator'];
