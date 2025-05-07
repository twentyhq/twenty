import { ObjectRecordsPermissions } from '@/types';

export type ObjectRecordsPermissionsByRoleId = {
  [roleId: string]: ObjectRecordsPermissions;
};
