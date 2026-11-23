import { type DisableableObjectPermissionAction } from 'twenty-shared/application';

// sorted to match the order the upgrade commands store them in
export const PLATFORM_MANAGED_DISABLED_OBJECT_PERMISSION_ACTIONS: DisableableObjectPermissionAction[] =
  [
    'canCreateObjectRecords',
    'canDestroyObjectRecords',
    'canReadObjectRecords',
    'canSoftDeleteObjectRecords',
    'canUpdateObjectRecords',
  ];

export const PLATFORM_WRITTEN_DISABLED_OBJECT_PERMISSION_ACTIONS: DisableableObjectPermissionAction[] =
  [
    'canCreateObjectRecords',
    'canDestroyObjectRecords',
    'canSoftDeleteObjectRecords',
    'canUpdateObjectRecords',
  ];
