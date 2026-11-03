import { RecordFilterGroupLogicalOperator } from 'twenty-shared/types';

export const isRecordFilterGroupLogicalOperator = (
  logicalOperator: unknown,
): logicalOperator is RecordFilterGroupLogicalOperator =>
  Object.values<unknown>(RecordFilterGroupLogicalOperator).includes(
    logicalOperator,
  );
