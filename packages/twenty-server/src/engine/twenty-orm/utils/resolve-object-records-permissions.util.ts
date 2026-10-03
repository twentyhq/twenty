import {
  type ObjectsPermissions,
  type ObjectsPermissionsByRoleId,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { computePermissionIntersection } from 'src/engine/twenty-orm/utils/compute-permission-intersection.util';
import {
  TwentyOrmException,
  TwentyOrmExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';
import { type RecordReadScope } from 'src/engine/twenty-orm/types/record-read-scope.type';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config.type';

export const resolveObjectRecordsPermissions = ({
  rolePermissionConfig,
  objectPermissionsByRoleId,
}: {
  rolePermissionConfig?: RolePermissionConfig;
  objectPermissionsByRoleId: ObjectsPermissionsByRoleId;
}): {
  objectRecordsPermissions: ObjectsPermissions;
  shouldBypassPermissionChecks: boolean;
  readScope: RecordReadScope;
} => {
  if (!isDefined(rolePermissionConfig)) {
    return {
      objectRecordsPermissions: {},
      shouldBypassPermissionChecks: false,
      readScope: 'content',
    };
  }

  if ('shouldBypassPermissionChecks' in rolePermissionConfig) {
    return {
      objectRecordsPermissions: {},
      shouldBypassPermissionChecks:
        rolePermissionConfig.shouldBypassPermissionChecks,
      readScope: 'content',
    };
  }

  const readScope = rolePermissionConfig.readScope ?? 'content';

  if ('unionOf' in rolePermissionConfig) {
    if (rolePermissionConfig.unionOf.length !== 1) {
      throw new TwentyOrmException(
        'Union permission logic for multiple roles not yet implemented',
        TwentyOrmExceptionCode.UNSUPPORTED_OPERATION,
      );
    }

    return {
      objectRecordsPermissions:
        objectPermissionsByRoleId[rolePermissionConfig.unionOf[0]] ?? {},
      shouldBypassPermissionChecks: false,
      readScope,
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
    readScope,
  };
};
