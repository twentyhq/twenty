import { type ObjectPermissionAction } from 'twenty-shared/application';

// sorted to match the order the 2.53 upgrade command stores them in
export const PLATFORM_MANAGED_DISABLED_OBJECT_PERMISSION_ACTIONS: ObjectPermissionAction[] =
  [
    'canDestroyObjectRecords',
    'canReadObjectRecords',
    'canSoftDeleteObjectRecords',
    'canUpdateObjectRecords',
  ];

export const PLATFORM_WRITTEN_DISABLED_OBJECT_PERMISSION_ACTIONS: ObjectPermissionAction[] =
  [
    'canDestroyObjectRecords',
    'canSoftDeleteObjectRecords',
    'canUpdateObjectRecords',
  ];
