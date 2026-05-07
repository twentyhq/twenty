export const PERMISSION_FLAG_DEFINITION_PERMISSION_TYPES = [
  'settings',
  'tool',
] as const;

export type PermissionFlagDefinitionPermissionType =
  (typeof PERMISSION_FLAG_DEFINITION_PERMISSION_TYPES)[number];
