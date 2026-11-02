/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsObjectAccessRequest } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { resolveRowLevelPermissionRecordFilter } from 'src/engine/permissions/rls/utils/resolve-row-level-permission-record-filter.util';
import { isObjectOperationDisabledToPrincipal } from 'src/engine/permissions/role/utils/is-object-operation-disabled-to-principal.util';
import { isRolePermittingOperation } from 'src/engine/permissions/role/utils/is-role-permitting-operation.util';

// Private records are never covered: only their creator and shares reach them
export const hasAccessToAllRecords = (
  request: PermissionsObjectAccessRequest,
): boolean =>
  !isObjectOperationDisabledToPrincipal(request) &&
  isRolePermittingOperation(request) &&
  !isDefined(resolveRowLevelPermissionRecordFilter(request));
