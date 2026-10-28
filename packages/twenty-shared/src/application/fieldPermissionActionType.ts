export const FIELD_PERMISSION_ACTIONS = [
  'canReadFieldValue',
  'canUpdateFieldValue',
] as const;

export type FieldPermissionAction = (typeof FIELD_PERMISSION_ACTIONS)[number];
