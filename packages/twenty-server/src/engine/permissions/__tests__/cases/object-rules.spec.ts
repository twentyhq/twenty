import { describeRecordAccess } from 'src/engine/permissions/__tests__/framework/describe-record-access.util';
import {
  application,
  CUSTOM_APPLICATION,
  EVERY_OPERATION,
  NO_LIMITING_PRINCIPAL,
  NO_OPERATION,
  SAME_APPLICATION_AS_MAIN,
  workspaceMember,
} from 'src/engine/permissions/__tests__/framework/given-principals.util';

describeRecordAccess('a disabled object action, for a role with all records', {
  given: {
    mainPrincipal: workspaceMember({ role: 'allRecords' }),
    limitingPrincipal: NO_LIMITING_PRINCIPAL,
    applicationPrincipal: CUSTOM_APPLICATION,
    isSharingEnabled: false,
  },
  cases: [
    { it: 'nothing disabled', grants: EVERY_OPERATION },
    {
      it: 'canReadObjectRecords denies reading',
      given: { disabledObjectPermissionActions: ['canReadObjectRecords'] },
      grants: ['update', 'soft-delete', 'restore', 'delete'],
    },
    {
      it: 'canUpdateObjectRecords denies updates',
      given: { disabledObjectPermissionActions: ['canUpdateObjectRecords'] },
      grants: ['select', 'soft-delete', 'restore', 'delete'],
    },
    {
      it: 'canSoftDeleteObjectRecords denies soft delete and restore',
      given: {
        disabledObjectPermissionActions: ['canSoftDeleteObjectRecords'],
      },
      grants: ['select', 'update', 'delete'],
    },
    {
      it: 'canDestroyObjectRecords denies destroying',
      given: { disabledObjectPermissionActions: ['canDestroyObjectRecords'] },
      grants: ['select', 'update', 'soft-delete', 'restore'],
    },
  ],
});

describeRecordAccess('a disabled object action, for an application', {
  given: {
    mainPrincipal: application({ role: 'allRecords' }),
    limitingPrincipal: NO_LIMITING_PRINCIPAL,
    applicationPrincipal: SAME_APPLICATION_AS_MAIN,
    isSharingEnabled: false,
    disabledObjectPermissionActions: [
      'canReadObjectRecords',
      'canUpdateObjectRecords',
      'canSoftDeleteObjectRecords',
      'canDestroyObjectRecords',
    ],
  },
  cases: [
    {
      it: 'does not bind the one owning the object',
      given: { isObjectOwnedByMainApplication: true },
      grants: EVERY_OPERATION,
    },
    { it: 'binds any other', grants: NO_OPERATION },
  ],
});
