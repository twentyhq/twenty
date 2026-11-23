/* @license Enterprise */

import {
  RecordShareAccessLevel,
  type ObjectRecordsOperationType,
} from 'twenty-shared/types';

const REQUIRED_RECORD_SHARE_ACCESS_LEVELS_BY_OPERATION_TYPE: Record<
  ObjectRecordsOperationType,
  RecordShareAccessLevel[]
> = {
  read: [
    RecordShareAccessLevel.READ,
    RecordShareAccessLevel.READ_WRITE,
    RecordShareAccessLevel.FULL,
  ],
  // an insert has no record yet, so no share row can exist to check: whether
  // the caller may create at all stays the role's object-level decision
  create: [],
  update: [RecordShareAccessLevel.READ_WRITE, RecordShareAccessLevel.FULL],
  softDelete: [RecordShareAccessLevel.FULL],
  destroy: [RecordShareAccessLevel.FULL],
};

export const resolveRequiredRecordShareAccessLevels = (
  operationType: ObjectRecordsOperationType,
): RecordShareAccessLevel[] =>
  REQUIRED_RECORD_SHARE_ACCESS_LEVELS_BY_OPERATION_TYPE[operationType];
