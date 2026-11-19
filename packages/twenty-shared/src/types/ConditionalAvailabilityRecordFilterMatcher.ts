import { type ConditionalAvailabilityRecordFilter } from './ConditionalAvailabilityRecordFilter';

export type ConditionalAvailabilityRecordFilterMatcher = (args: {
  record: unknown;
  recordFilter: ConditionalAvailabilityRecordFilter;
}) => boolean;
