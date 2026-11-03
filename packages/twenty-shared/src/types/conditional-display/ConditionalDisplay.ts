import { type ConditionalDisplayRecordFilter } from './ConditionalDisplayRecordFilter';
import { type ConditionalDisplayRecordFilterGroup } from './ConditionalDisplayRecordFilterGroup';
import { type ConditionalDisplaySelectedRecordsMatch } from './ConditionalDisplaySelectedRecordsMatch';

export type ConditionalDisplay = {
  recordFilters?: ConditionalDisplayRecordFilter[];
  recordFilterGroups?: ConditionalDisplayRecordFilterGroup[];
  selectedRecordsMatch?: ConditionalDisplaySelectedRecordsMatch;
};
