import { type ConditionalAvailabilityComparisonOperator } from '@/conditional-availability/types/ConditionalAvailabilityComparisonOperator';
import { type ConditionalAvailabilityLogicalOperator } from '@/conditional-availability/types/ConditionalAvailabilityLogicalOperator';

export type ConditionalAvailabilityNode =
  | { type: 'LITERAL'; value: string | number | boolean }
  | { type: 'VARIABLE'; path: string }
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
      type: 'FUNCTION_CALL';
      functionName: string;
      arguments: ConditionalAvailabilityNode[];
    };
