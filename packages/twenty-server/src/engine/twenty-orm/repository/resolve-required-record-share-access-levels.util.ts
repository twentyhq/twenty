import { RecordShareAccessLevel } from 'twenty-shared/types';

import { type OperationType } from 'src/engine/twenty-orm/repository/permissions.utils';

const REQUIRED_RECORD_SHARE_ACCESS_LEVELS_BY_OPERATION_TYPE: Record<
  OperationType,
  RecordShareAccessLevel[]
> = {
  select: [
    RecordShareAccessLevel.READ,
    RecordShareAccessLevel.READ_WRITE,
    RecordShareAccessLevel.FULL,
  ],
  // an insert has no record yet, so no share row can exist to check: whether
  // the caller may create at all stays the role's object-level decision
  insert: [],
  update: [RecordShareAccessLevel.READ_WRITE, RecordShareAccessLevel.FULL],
  'soft-delete': [RecordShareAccessLevel.FULL],
  restore: [RecordShareAccessLevel.FULL],
  delete: [RecordShareAccessLevel.FULL],
};

export const resolveRequiredRecordShareAccessLevels = (
  operationType: OperationType,
): RecordShareAccessLevel[] =>
  REQUIRED_RECORD_SHARE_ACCESS_LEVELS_BY_OPERATION_TYPE[operationType];
