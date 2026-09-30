export const OBJECT_PERMISSION_ACTIONS = [
  'canReadObjectRecords',
  'canUpdateObjectRecords',
  'canSoftDeleteObjectRecords',
  'canDestroyObjectRecords',
] as const;

export type ObjectPermissionAction = (typeof OBJECT_PERMISSION_ACTIONS)[number];
