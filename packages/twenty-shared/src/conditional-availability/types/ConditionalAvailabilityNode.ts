import { type ConditionalAvailabilityComparisonOperator } from './ConditionalAvailabilityComparisonOperator';
import { type ConditionalAvailabilityLogicalOperator } from './ConditionalAvailabilityLogicalOperator';

export type ConditionalAvailabilityNode =
  | { type: 'LITERAL'; value: string | number | boolean }
  | { type: 'PATH'; path: string }
  | {
      type: 'COMPARISON';
      operator: ConditionalAvailabilityComparisonOperator;
      left: ConditionalAvailabilityNode;
      right: ConditionalAvailabilityNode;
    }
  | {
      type: 'GROUP';
      logicalOperator: ConditionalAvailabilityLogicalOperator;
      children: ConditionalAvailabilityNode[];
    }
  | { type: 'NOT'; child: ConditionalAvailabilityNode }
  | {
      type: 'CALL';
      functionName: string;
      arguments: ConditionalAvailabilityNode[];
    };
