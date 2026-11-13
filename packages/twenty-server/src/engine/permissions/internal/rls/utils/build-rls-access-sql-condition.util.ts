/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsRowAccessSqlRequest } from 'src/engine/permissions/internal/combine/types/permissions-access-request.type';
import { buildRecordAccessGroupsSQLCondition } from 'src/engine/permissions/internal/access-group/utils/build-record-access-groups-sql-condition.util';
import { canRlsAccessOperation } from 'src/engine/permissions/internal/rls/utils/can-rls-access-operation.util';
import { renderRlsRecordFilterToSql } from 'src/engine/permissions/internal/rls/utils/render-rls-record-filter-to-sql.util';
import { resolveRlsRuleRecordFilter } from 'src/engine/permissions/internal/rls/utils/resolve-rls-rule-record-filter.util';
import { type SQLCondition } from 'src/engine/permissions/types/sql-condition.type';

const buildRlsRulesSQLCondition = (
  request: PermissionsRowAccessSqlRequest,
): SQLCondition | null => {
  const rlsRuleRecordFilter = resolveRlsRuleRecordFilter(request);

  if (!isDefined(rlsRuleRecordFilter)) {
    return null;
  }

  if (isDefined(request.principalsAccessGroupCompactIds)) {
    return buildRecordAccessGroupsSQLCondition({
      tableAlias: request.tableAlias,
      principalsAccessGroupCompactIds: request.principalsAccessGroupCompactIds,
    });
  }

  return renderRlsRecordFilterToSql({
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
