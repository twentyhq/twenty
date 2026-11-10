/* @license Enterprise */

import { type RecordGqlOperationFilter } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type PermissionsRowAccessSqlRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { buildRecordAccessGroupsSQLCondition } from 'src/engine/permissions/internal/rls/utils/build-record-access-groups-sql-condition.util';
import { renderRowLevelPermissionFilterToSql } from 'src/engine/permissions/internal/rls/utils/render-row-level-permission-filter-to-sql.util';
import { type SQLCondition } from 'src/engine/permissions/types/sql-condition.type';

export const resolvePermissionsRowLevelPermissionSQLCondition = ({
  request,
  rlsRuleFilter,
}: {
  request: Pick<
    PermissionsRowAccessSqlRequest,
    | 'tableAlias'
    | 'callerAccessGroupCompactIds'
    | 'flatObjectMetadata'
    | 'metadataMaps'
  >;
  rlsRuleFilter: RecordGqlOperationFilter;
}): SQLCondition | undefined => {
  if (isDefined(request.callerAccessGroupCompactIds)) {
    return buildRecordAccessGroupsSQLCondition({
      tableAlias: request.tableAlias,
      callerAccessGroupCompactIds: request.callerAccessGroupCompactIds,
    });
  }

  return (
    renderRowLevelPermissionFilterToSql({
      recordFilter: rlsRuleFilter,
      tableAlias: request.tableAlias,
      objectMetadata: request.flatObjectMetadata,
      flatFieldMetadataMaps: request.metadataMaps.flatFieldMetadataMaps,
      flatObjectMetadataMaps: request.metadataMaps.flatObjectMetadataMaps,
    }) ?? undefined
  );
};
