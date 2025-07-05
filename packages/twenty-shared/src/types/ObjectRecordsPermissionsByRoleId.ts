import { ObjectRecordsPermissions } from '@/types/ObjectRecordsPermissions';

type RoleId = string;
export type ObjectRecordsPermissionsByRoleId = Record<
  RoleId,
  ObjectRecordsPermissions
>;
