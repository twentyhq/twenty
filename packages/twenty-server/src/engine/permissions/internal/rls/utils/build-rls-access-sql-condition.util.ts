/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsRowAccessSqlRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { buildRecordAccessGroupsSQLCondition } from 'src/engine/permissions/internal/rls/utils/build-record-access-groups-sql-condition.util';
import { canRlsAccessOperation } from 'src/engine/permissions/internal/rls/utils/can-rls-access-operation.util';
import { renderRowLevelPermissionFilterToSql } from 'src/engine/permissions/internal/rls/utils/render-row-level-permission-filter-to-sql.util';
import { resolveRlsRuleRecordFilter } from 'src/engine/permissions/internal/rls/utils/resolve-rls-rule-record-filter.util';
import { type SQLCondition } from 'src/engine/permissions/types/sql-condition.type';

const buildRlsRulesSQLCondition = (
  request: PermissionsRowAccessSqlRequest,
): SQLCondition | null => {
  const rlsRuleRecordFilter = resolveRlsRuleRecordFilter(request);

  if (!isDefined(rlsRuleRecordFilter)) {
    return null;
  }

  if (isDefined(request.callerAccessGroupCompactIds)) {
    return buildRecordAccessGroupsSQLCondition({
      tableAlias: request.tableAlias,
      callerAccessGroupCompactIds: request.callerAccessGroupCompactIds,
    });
  }

  return renderRowLevelPermissionFilterToSql({
    recordFilter: rlsRuleRecordFilter,
    tableAlias: request.tableAlias,
    objectMetadata: request.flatObjectMetadata,
    flatFieldMetadataMaps: request.metadataMaps.flatFieldMetadataMaps,
    flatObjectMetadataMaps: request.metadataMaps.flatObjectMetadataMaps,
  });
};

export const buildRlsAccessSQLCondition = (
  request: PermissionsRowAccessSqlRequest,
): SQLCondition | false => {
  if (!canRlsAccessOperation(request)) {
    return false;
  }

  const rlsRulesSQLCondition = buildRlsRulesSQLCondition(request);

  return rlsRulesSQLCondition ?? false;
};
