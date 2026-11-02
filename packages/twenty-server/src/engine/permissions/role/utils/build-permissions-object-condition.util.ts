/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import {
  type PermissionsRowAccessSqlRequest,
  type SqlCondition,
} from 'src/engine/permissions/combine/types/row-access-policy.type';
import { buildRecordPrivacyCondition } from 'src/engine/permissions/private-record/utils/build-record-privacy-condition.util';
import { areRoleGrantsLimitedToPublicRecords } from 'src/engine/permissions/role/utils/are-role-grants-limited-to-public-records.util';
import { isRolePermittingOperation } from 'src/engine/permissions/role/utils/is-role-permitting-operation.util';
import { resolvePermissionsRowLevelPermissionFilter } from 'src/engine/permissions/rls/utils/resolve-permissions-row-level-permission-filter.util';

export const buildPermissionsObjectCondition = (
  request: PermissionsRowAccessSqlRequest,
): SqlCondition | boolean => {
  if (
    !isRolePermittingOperation(request) ||
    isDefined(resolvePermissionsRowLevelPermissionFilter(request))
  ) {
    return false;
  }

  return areRoleGrantsLimitedToPublicRecords(request)
    ? buildRecordPrivacyCondition({
        tableAlias: request.tableAlias,
        isPrivate: false,
      })
    : true;
};
