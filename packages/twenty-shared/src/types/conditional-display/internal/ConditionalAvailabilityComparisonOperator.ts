import { type ConditionalAvailabilityExpressionNode } from '../ConditionalAvailabilityExpressionNode';

export type ConditionalAvailabilityComparisonOperator = Extract<
  ConditionalAvailabilityExpressionNode,
  { kind: 'comparison' }
>['operator'];
