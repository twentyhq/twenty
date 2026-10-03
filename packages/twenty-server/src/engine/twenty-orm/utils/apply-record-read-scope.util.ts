import { type RecordReadScope } from 'src/engine/twenty-orm/types/record-read-scope.type';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config.type';

export const applyRecordReadScope = (
  rolePermissionConfig: RolePermissionConfig,
  readScope: RecordReadScope | undefined,
): RolePermissionConfig => {
  if (
    readScope !== 'existence' ||
    'shouldBypassPermissionChecks' in rolePermissionConfig
  ) {
    return rolePermissionConfig;
  }

  return { ...rolePermissionConfig, readScope };
};
