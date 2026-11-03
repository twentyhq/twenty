import { type ConditionalAvailabilityExpressionLiteral } from './ConditionalAvailabilityExpressionLiteral';
import { type ConditionalDisplayConditionNode } from '../ConditionalDisplayConditionNode';

export type ConditionalAvailabilityCompiledItem =
  | ConditionalDisplayConditionNode
  | { kind: 'literal'; value: ConditionalAvailabilityExpressionLiteral }
  | { kind: 'list'; values: ConditionalAvailabilityExpressionLiteral[] }
  | { kind: 'reference'; name: string; subFieldName?: string }
  | { kind: 'favoriteRecordCount' };
