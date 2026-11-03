import { type ConditionalAvailabilityExpressionNode } from '../ConditionalAvailabilityExpressionNode';

export type ConditionalAvailabilityExpressionLiteral = Extract<
  ConditionalAvailabilityExpressionNode,
  { kind: 'literal' }
>['value'];
