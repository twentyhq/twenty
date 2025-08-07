import { ObjectPermissionsDeprecated } from '@/types/ObjectPermissionsDeprecated';

type RoleId = string;

// TODO: DEPRECATE THIS
export type ObjectPermissionsByRoleIdDeprecated = Record<
  RoleId,
  ObjectPermissionsDeprecated
>;
