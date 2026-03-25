import { type ObjectsPermissions } from './ObjectsPermissions';

type RoleId = string;

export type ObjectsPermissionsByRoleId = Record<RoleId, ObjectsPermissions>;
