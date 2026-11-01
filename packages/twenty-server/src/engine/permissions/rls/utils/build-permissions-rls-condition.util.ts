/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import {
  type PermissionsRowAccessSqlRequest,
  type SqlCondition,
} from 'src/engine/permissions/combine/types/row-access-policy.type';
import { combineSqlConditions } from 'src/engine/permissions/combine/utils/combine-sql-conditions.util';
import { buildRecordPrivacyCondition } from 'src/engine/permissions/private-record/utils/build-record-privacy-condition.util';
import { areRoleGrantsLimitedToPublicRecords } from 'src/engine/permissions/role/utils/are-role-grants-limited-to-public-records.util';
import { resolvePermissionsRowLevelPermissionFilter } from 'src/engine/permissions/rls/utils/resolve-permissions-row-level-permission-filter.util';

export const buildPermissionsRlsCondition = (
  request: PermissionsRowAccessSqlRequest,
): SqlCondition | undefined => {
  const rowLevelPermissionFilter =
    resolvePermissionsRowLevelPermissionFilter(request);

  if (!isDefined(rowLevelPermissionFilter)) {
    return undefined;
  }

  return areRoleGrantsLimitedToPublicRecords(request)
    ? combineSqlConditions([
        rowLevelPermissionFilter.condition,
        buildRecordPrivacyCondition({
          tableAlias: request.tableAlias,
          isPrivate: false,
        }),
      ])
    : rowLevelPermissionFilter.condition;
};
