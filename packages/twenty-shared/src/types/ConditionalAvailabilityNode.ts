import { type ConditionalAvailabilityComparisonOperator } from './ConditionalAvailabilityComparisonOperator';
import { type ConditionalAvailabilityLogicalOperator } from './ConditionalAvailabilityLogicalOperator';
import { type ConditionalAvailabilityRecordFilter } from './ConditionalAvailabilityRecordFilter';
import { type ConditionalAvailabilityRecordQuantifier } from './ConditionalAvailabilityRecordQuantifier';

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
    }
  | {
      type: 'SELECTED_RECORDS';
      quantifier: ConditionalAvailabilityRecordQuantifier;
      recordFilter: ConditionalAvailabilityRecordFilter;
    };
