import { type ObjectsPermissionsDeprecated } from './ObjectsPermissionsDeprecated';

type RoleId = string;

// TODO: DEPRECATE THIS
export type ObjectsPermissionsByRoleIdDeprecated = Record<
  RoleId,
  ObjectsPermissionsDeprecated
>;
