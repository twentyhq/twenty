import { type ConditionalDisplayQuantifier } from './ConditionalDisplayQuantifier';
import { type ConditionalDisplayRecordFilter } from './ConditionalDisplayRecordFilter';
import { type ConditionalDisplayRecordFilterGroup } from './ConditionalDisplayRecordFilterGroup';

export type ConditionalDisplay = {
  recordFilters?: ConditionalDisplayRecordFilter[];
  recordFilterGroups?: ConditionalDisplayRecordFilterGroup[];
  quantifier?: ConditionalDisplayQuantifier;
};
