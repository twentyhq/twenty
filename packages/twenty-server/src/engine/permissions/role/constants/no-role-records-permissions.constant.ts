import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

export const NO_ROLE_RECORDS_PERMISSIONS: RoleRecordsPermissions = {
  canReadAllRecords: false,
  canUpdateAllRecords: false,
  canSoftDeleteAllRecords: false,
  canDestroyAllRecords: false,
  objects: {},
};
