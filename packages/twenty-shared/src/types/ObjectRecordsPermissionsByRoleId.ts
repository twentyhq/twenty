import { ObjectRecordsPermissions } from './ObjectRecordsPermissions';

type RoleId = string;
export type ObjectRecordsPermissionsByRoleId = Record<
  RoleId,
  ObjectRecordsPermissions
>;
