import {
  type ObjectsPermissions,
  type ObjectsPermissionsByRoleId,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { computePermissionIntersection } from 'src/engine/twenty-orm/utils/compute-permission-intersection.util';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config.type';
import { getRoleIdsToIntersect } from 'src/engine/twenty-orm/utils/get-role-ids-to-intersect.util';

export const resolveObjectRecordsPermissions = ({
  rolePermissionConfig,
  objectPermissionsByRoleId,
}: {
  rolePermissionConfig?: RolePermissionConfig;
  objectPermissionsByRoleId: ObjectsPermissionsByRoleId;
}): {
  objectRecordsPermissions: ObjectsPermissions;
  shouldBypassPermissionChecks: boolean;
} => {
  if (!isDefined(rolePermissionConfig)) {
    return {
      objectRecordsPermissions: {},
      shouldBypassPermissionChecks: false,
    };
  }

  if ('shouldBypassPermissionChecks' in rolePermissionConfig) {
    return {
      objectRecordsPermissions: {},
      shouldBypassPermissionChecks:
        rolePermissionConfig.shouldBypassPermissionChecks,
    };
  }

  const roleIds = getRoleIdsToIntersect(rolePermissionConfig.intersectionOf);

  if (!isDefined(roleIds)) {
    return {
      objectRecordsPermissions: {},
      shouldBypassPermissionChecks: false,
    };
  }

  const allRolePermissions = roleIds.map(
    (roleId) => objectPermissionsByRoleId[roleId],
  );

  return {
    objectRecordsPermissions: allRolePermissions.every(isDefined)
      ? computePermissionIntersection(allRolePermissions)
      : {},
    shouldBypassPermissionChecks: false,
  };
};
