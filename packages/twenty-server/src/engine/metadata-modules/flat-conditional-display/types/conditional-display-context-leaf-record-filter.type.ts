import { type ViewFilterOperand } from 'twenty-shared/types';

export type ConditionalDisplayContextLeafRecordFilter = {
  operand: ViewFilterOperand;
  subFieldName?: string | null;
  value?: string | null;
};
