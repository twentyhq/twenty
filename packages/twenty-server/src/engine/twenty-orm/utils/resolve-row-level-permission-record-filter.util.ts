/* @license Enterprise */

import { type RecordGqlOperationFilter } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';
import { buildRowLevelPermissionRecordFilter } from 'src/engine/twenty-orm/utils/build-row-level-permission-record-filter.util';
import { resolveRowLevelPermissionRoleIds } from 'src/engine/twenty-orm/utils/resolve-row-level-permission-role-ids.util';

export const resolveRowLevelPermissionRecordFilter = ({
  internalContext,
  authContext,
  objectMetadata,
  rolePermissionConfig,
}: {
  internalContext: WorkspaceInternalContext;
  authContext: WorkspaceAuthContext;
  objectMetadata: FlatObjectMetadata;
  rolePermissionConfig?: RolePermissionConfig;
}): RecordGqlOperationFilter | null => {
  const roleIds = resolveRowLevelPermissionRoleIds({
    authContext,
    userWorkspaceRoleMap: internalContext.userWorkspaceRoleMap,
    apiKeyRoleMap: internalContext.apiKeyRoleMap,
    rolePermissionConfig,
  });

  const recordFilter = buildRowLevelPermissionRecordFilter({
    flatRowLevelPermissionPredicateMaps:
      internalContext.flatRowLevelPermissionPredicateMaps,
    flatRowLevelPermissionPredicateGroupMaps:
      internalContext.flatRowLevelPermissionPredicateGroupMaps,
    flatFieldMetadataMaps: internalContext.flatFieldMetadataMaps,
    objectMetadata,
    roleIds,
    workspaceMember: isUserAuthContext(authContext)
      ? authContext.workspaceMember
      : undefined,
  });

  if (!isDefined(recordFilter) || Object.keys(recordFilter).length === 0) {
    return null;
  }

  return recordFilter;
};
