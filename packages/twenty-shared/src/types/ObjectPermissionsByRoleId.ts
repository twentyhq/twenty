import { ObjectPermissions } from '@/types/ObjectPermissions';

type RoleId = string;

export type ObjectPermissionsByRoleId = Record<RoleId, ObjectPermissions>;
