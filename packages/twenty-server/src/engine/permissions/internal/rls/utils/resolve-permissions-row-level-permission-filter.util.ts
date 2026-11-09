/* @license Enterprise */

import { type RecordGqlOperationFilter } from 'twenty-shared/types';

import { type PermissionsRowAccessRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { isRolePermittingOperation } from 'src/engine/permissions/internal/role/utils/is-role-permitting-operation.util';
import { resolveRlsRuleRecordFilter } from 'src/engine/permissions/internal/rls/utils/resolve-rls-rule-record-filter.util';

export const resolvePermissionsRowLevelPermissionFilter = (
  request: PermissionsRowAccessRequest,
): RecordGqlOperationFilter | undefined => {
  if (!isRolePermittingOperation(request)) {
    return undefined;
  }

  return (
    resolveRlsRuleRecordFilter({
      principals: request.principals,
      metadataMaps: request.metadataMaps,
      flatObjectMetadata: request.flatObjectMetadata,
    }) ?? undefined
  );
};
