/* @license Enterprise */

import { type RecordGqlOperationFilter } from 'twenty-shared/types';

import { type PermissionsRowAccessRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { canAllRecordsOrRowLevelPermissionsGrantOperation } from 'src/engine/permissions/internal/role/utils/can-all-records-or-row-level-permissions-grant-operation.util';
import { resolveRlsRuleRecordFilter } from 'src/engine/permissions/internal/rls/utils/resolve-rls-rule-record-filter.util';

export const resolvePermissionsRowLevelPermissionFilter = (
  request: PermissionsRowAccessRequest,
): RecordGqlOperationFilter | undefined => {
  if (!canAllRecordsOrRowLevelPermissionsGrantOperation(request)) {
    return undefined;
  }

  return (
    resolveRlsRuleRecordFilter({
      principals: request.principals,
      metadataMaps: request.metadataMaps,
      flatObjectMetadata: request.flatObjectMetadata,
      operationType: request.operationType,
    }) ?? undefined
  );
};
