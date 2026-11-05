/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsRowAccessSqlRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { type SqlCondition } from 'src/engine/permissions/types/sql-condition.type';
import { combineSqlConditions } from 'src/engine/permissions/internal/combine/utils/combine-sql-conditions.util';
import { buildRecordPrivacyCondition } from 'src/engine/permissions/internal/private-record/utils/build-record-privacy-condition.util';
import { areRoleGrantsLimitedToPublicRecords } from 'src/engine/permissions/internal/role/utils/are-role-grants-limited-to-public-records.util';
import { resolvePermissionsRowLevelPermissionFilter } from 'src/engine/permissions/internal/rls/utils/resolve-permissions-row-level-permission-filter.util';

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
