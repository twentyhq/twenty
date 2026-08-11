import {
  type ObjectsPermissions,
  type ObjectsPermissionsByRoleId,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { computePermissionIntersection } from 'src/engine/twenty-orm/utils/compute-permission-intersection.util';
import {
  TwentyOrmV2Exception,
  TwentyOrmV2ExceptionCode,
} from 'src/engine/twenty-orm-v2/exceptions/twenty-orm-v2.exception';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';

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

  if ('unionOf' in rolePermissionConfig) {
    if (rolePermissionConfig.unionOf.length !== 1) {
      throw new TwentyOrmV2Exception(
        'Union permission logic for multiple roles not yet implemented',
        TwentyOrmV2ExceptionCode.UNSUPPORTED_OPERATION,
      );
    }

    return {
      objectRecordsPermissions:
        objectPermissionsByRoleId[rolePermissionConfig.unionOf[0]] ?? {},
      shouldBypassPermissionChecks: false,
    };
  }

  const allRolePermissions = rolePermissionConfig.intersectionOf.map(
    (roleId) => objectPermissionsByRoleId[roleId],
  );

  return {
    objectRecordsPermissions: allRolePermissions.every(isDefined)
      ? computePermissionIntersection(allRolePermissions)
      : {},
    shouldBypassPermissionChecks: false,
  };
};
