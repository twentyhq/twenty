/* @license Enterprise */

import { type RecordGqlOperationFilter } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  type PermissionsRowAccessRequest,
  type SqlCondition,
} from 'src/engine/permissions/combine/types/row-access-policy.type';
import { isRolePermittingOperation } from 'src/engine/permissions/role/utils/is-role-permitting-operation.util';
import { renderRowLevelPermissionFilterToSql } from 'src/engine/permissions/rls/utils/render-row-level-permission-filter-to-sql.util';

export const resolvePermissionsRowLevelPermissionFilter = ({
  tableAlias,
  ...request
}: PermissionsRowAccessRequest & { tableAlias: string }):
  | { recordFilter: RecordGqlOperationFilter; condition: SqlCondition }
  | undefined => {
  const { subject, environment, flatObjectMetadata } = request;

  if (!isRolePermittingOperation(request)) {
    return undefined;
  }

  const recordFilter =
    subject.resolveRowLevelPermissionRecordFilter(flatObjectMetadata);

  if (!isDefined(recordFilter)) {
    return undefined;
  }

  const condition = renderRowLevelPermissionFilterToSql({
    recordFilter,
    tableAlias,
    objectMetadata: flatObjectMetadata,
    flatFieldMetadataMaps: environment.flatFieldMetadataMaps,
  });

  // A filter whose predicates all cancel out restricts nothing
  if (!isDefined(condition)) {
    return undefined;
  }

  return { recordFilter, condition };
};
