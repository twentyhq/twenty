import { ObjectsPermissions } from '@/types/ObjectsPermissions';

type RoleId = string;

export type ObjectsPermissionsByRoleId = Record<RoleId, ObjectsPermissions>;
