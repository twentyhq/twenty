import { type RecordOperation } from 'twenty-shared/types';

import { type OperationType } from 'src/engine/twenty-orm/repository/permissions.utils';

export const RECORD_OPERATION_BY_OPERATION_TYPE = {
  select: 'read',
  insert: 'create',
  update: 'update',
  delete: 'destroy',
  'soft-delete': 'softDelete',
  restore: 'restore',
} as const satisfies Record<OperationType, RecordOperation>;
