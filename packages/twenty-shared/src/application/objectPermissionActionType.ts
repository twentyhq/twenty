export const OBJECT_PERMISSION_ACTIONS = [
  'canReadObjectRecords',
  'canUpdateObjectRecords',
  'canSoftDeleteObjectRecords',
  'canDestroyObjectRecords',
] as const;

export type ObjectPermissionAction = (typeof OBJECT_PERMISSION_ACTIONS)[number];

export const DISABLEABLE_OBJECT_PERMISSION_ACTIONS = [
  ...OBJECT_PERMISSION_ACTIONS,
  'canCreateObjectRecords',
] as const;

export type DisableableObjectPermissionAction =
  (typeof DISABLEABLE_OBJECT_PERMISSION_ACTIONS)[number];
