import { type RecordFilterGroupLogicalOperator } from '../RecordFilterGroupLogicalOperator';

export type ConditionalDisplayRecordFilterGroup = {
  id: string;
  logicalOperator: RecordFilterGroupLogicalOperator;
  parentRecordFilterGroupId?: string | null;
  positionInRecordFilterGroup?: number | null;
};
