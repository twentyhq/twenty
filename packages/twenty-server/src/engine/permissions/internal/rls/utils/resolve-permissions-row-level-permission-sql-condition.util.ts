/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsRowAccessSqlRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { buildRecordAccessGroupsCondition } from 'src/engine/permissions/internal/rls/utils/build-record-access-groups-condition.util';
import { renderRowLevelPermissionFilterToSql } from 'src/engine/permissions/internal/rls/utils/render-row-level-permission-filter-to-sql.util';
import { resolvePermissionsRowLevelPermissionFilter } from 'src/engine/permissions/internal/rls/utils/resolve-permissions-row-level-permission-filter.util';
import { type SqlCondition } from 'src/engine/permissions/types/sql-condition.type';

export const resolvePermissionsRowLevelPermissionSqlCondition = (
  request: PermissionsRowAccessSqlRequest,
): SqlCondition | undefined => {
  const recordFilter = resolvePermissionsRowLevelPermissionFilter(request);

  if (!isDefined(recordFilter)) {
    return undefined;
  }

  if (isDefined(request.callerAccessGroupCompactIds)) {
    return buildRecordAccessGroupsCondition({
      tableAlias: request.tableAlias,
      callerAccessGroupCompactIds: request.callerAccessGroupCompactIds,
    });
  }

  return (
    renderRowLevelPermissionFilterToSql({
      recordFilter,
      tableAlias: request.tableAlias,
      objectMetadata: request.flatObjectMetadata,
      flatFieldMetadataMaps: request.metadataMaps.flatFieldMetadataMaps,
      flatObjectMetadataMaps: request.metadataMaps.flatObjectMetadataMaps,
    }) ?? undefined
  );
};
