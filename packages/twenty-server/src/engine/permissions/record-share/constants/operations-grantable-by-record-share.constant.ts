/* @license Enterprise */

import { type ObjectPermissionAction } from 'twenty-shared/application';
import { type ObjectRecordsOperationType } from 'twenty-shared/types';

export const OPERATIONS_GRANTABLE_BY_RECORD_SHARE: {
  operationType: ObjectRecordsOperationType;
  objectPermissionAction: ObjectPermissionAction;
}[] = [
  { operationType: 'read', objectPermissionAction: 'canReadObjectRecords' },
  { operationType: 'update', objectPermissionAction: 'canUpdateObjectRecords' },
  {
    operationType: 'softDelete',
    objectPermissionAction: 'canSoftDeleteObjectRecords',
  },
  {
    operationType: 'destroy',
    objectPermissionAction: 'canDestroyObjectRecords',
  },
];
