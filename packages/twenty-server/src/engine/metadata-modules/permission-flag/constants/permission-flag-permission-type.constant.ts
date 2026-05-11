export const PERMISSION_FLAG_PERMISSION_TYPES = ['settings', 'tool'] as const;

export type PermissionFlagPermissionType =
  (typeof PERMISSION_FLAG_PERMISSION_TYPES)[number];
