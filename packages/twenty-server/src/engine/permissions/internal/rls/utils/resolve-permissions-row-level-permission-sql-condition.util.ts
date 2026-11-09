/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsRowAccessSqlRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { buildRecordAccessGroupsCondition } from 'src/engine/permissions/internal/rls/utils/build-record-access-groups-condition.util';
import { resolvePermissionsRowLevelPermissionFilter } from 'src/engine/permissions/internal/rls/utils/resolve-permissions-row-level-permission-filter.util';
import { type SqlCondition } from 'src/engine/permissions/types/sql-condition.type';

export const resolvePermissionsRowLevelPermissionSqlCondition = (
  request: PermissionsRowAccessSqlRequest,
): SqlCondition | undefined => {
  const rowLevelPermissionFilter =
    resolvePermissionsRowLevelPermissionFilter(request);

  if (!isDefined(rowLevelPermissionFilter)) {
    return undefined;
  }

  if (!isDefined(request.callerAccessGroupCompactIds)) {
    return rowLevelPermissionFilter.condition;
  }

  return buildRecordAccessGroupsCondition({
    tableAlias: request.tableAlias,
    callerAccessGroupCompactIds: request.callerAccessGroupCompactIds,
  });
};
