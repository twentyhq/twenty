import { describeRecordAccess } from 'src/engine/permissions/__tests__/framework/describe-record-access.util';
import {
  application,
  CUSTOM_APPLICATION,
  NO_LIMITING_PRINCIPAL,
  SAME_APPLICATION_AS_MAIN,
  workspaceMember,
} from 'src/engine/permissions/__tests__/framework/given-principals.util';
import {
  EVERY_OPERATION,
  NO_OPERATION,
} from 'src/engine/permissions/__tests__/framework/record-operations.constant';

describeRecordAccess({
  name: 'a disabled object action, for a role with all records',
  mainPrincipal: workspaceMember({ role: 'allRecords' }),
  limitingPrincipal: NO_LIMITING_PRINCIPAL,
  applicationPrincipal: CUSTOM_APPLICATION,
  cases: [
    { it: 'nothing disabled', grants: EVERY_OPERATION },
    {
      it: 'canReadObjectRecords denies reading',
      disabledObjectPermissionActions: ['canReadObjectRecords'],
      grants: ['update', 'soft-delete', 'restore', 'delete'],
    },
    {
      it: 'canUpdateObjectRecords denies updates',
      disabledObjectPermissionActions: ['canUpdateObjectRecords'],
      grants: ['select', 'soft-delete', 'restore', 'delete'],
    },
    {
      it: 'canSoftDeleteObjectRecords denies soft delete and restore',
      disabledObjectPermissionActions: ['canSoftDeleteObjectRecords'],
      grants: ['select', 'update', 'delete'],
    },
    {
      it: 'canDestroyObjectRecords denies destroying',
      disabledObjectPermissionActions: ['canDestroyObjectRecords'],
      grants: ['select', 'update', 'soft-delete', 'restore'],
    },
  ],
});

describeRecordAccess({
  name: 'a disabled object action, for an application',
  mainPrincipal: application({ role: 'allRecords' }),
  limitingPrincipal: NO_LIMITING_PRINCIPAL,
  applicationPrincipal: SAME_APPLICATION_AS_MAIN,
  disabledObjectPermissionActions: [
    'canReadObjectRecords',
    'canUpdateObjectRecords',
    'canSoftDeleteObjectRecords',
    'canDestroyObjectRecords',
  ],
  cases: [
    {
      it: 'does not bind the one owning the object',
      isObjectOwnedByMainApplication: true,
      grants: EVERY_OPERATION,
    },
    { it: 'binds any other', grants: NO_OPERATION },
  ],
});
