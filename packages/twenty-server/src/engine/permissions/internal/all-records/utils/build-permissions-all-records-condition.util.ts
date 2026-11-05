/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsRowAccessSqlRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { type SqlCondition } from 'src/engine/permissions/types/sql-condition.type';
import { buildRecordPrivacyCondition } from 'src/engine/permissions/internal/private-record/utils/build-record-privacy-condition.util';
import { areRoleGrantsLimitedToPublicRecords } from 'src/engine/permissions/internal/role/utils/are-role-grants-limited-to-public-records.util';
import { isRolePermittingOperation } from 'src/engine/permissions/internal/role/utils/is-role-permitting-operation.util';
import { resolvePermissionsRowLevelPermissionFilter } from 'src/engine/permissions/internal/rls/utils/resolve-permissions-row-level-permission-filter.util';

export const buildPermissionsAllRecordsCondition = (
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
