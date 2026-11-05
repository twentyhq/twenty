/* @license Enterprise */

import { type RecordGqlOperationFilter } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type PermissionsRowAccessRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { type SqlCondition } from 'src/engine/permissions/types/sql-condition.type';
import { isRolePermittingOperation } from 'src/engine/permissions/internal/role/utils/is-role-permitting-operation.util';
import { resolveRowLevelPermissionRecordFilter } from 'src/engine/permissions/internal/rls/utils/resolve-row-level-permission-record-filter.util';
import { renderRowLevelPermissionFilterToSql } from 'src/engine/permissions/internal/rls/utils/render-row-level-permission-filter-to-sql.util';

export const resolvePermissionsRowLevelPermissionFilter = ({
  tableAlias,
  ...request
}: PermissionsRowAccessRequest & { tableAlias: string }):
  | { recordFilter: RecordGqlOperationFilter; condition: SqlCondition }
  | undefined => {
  const { principals, metadataMaps, flatObjectMetadata } = request;

  if (!isRolePermittingOperation(request)) {
    return undefined;
  }

  const recordFilter = resolveRowLevelPermissionRecordFilter({
    principals,
    metadataMaps,
    flatObjectMetadata,
  });

  if (!isDefined(recordFilter)) {
    return undefined;
  }

  const condition = renderRowLevelPermissionFilterToSql({
    recordFilter,
    tableAlias,
    objectMetadata: flatObjectMetadata,
    flatFieldMetadataMaps: metadataMaps.flatFieldMetadataMaps,
  });

  if (!isDefined(condition)) {
    return undefined;
  }

  return { recordFilter, condition };
};
