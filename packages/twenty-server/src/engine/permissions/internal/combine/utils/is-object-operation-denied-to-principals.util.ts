/* @license Enterprise */

import { type PermissionsObjectAccessRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { canRecordShareGrantOperationToPrincipals } from 'src/engine/permissions/internal/record-share/utils/can-record-share-grant-operation-to-principals.util';
import { areLimitingRolesReachingAllRecords } from 'src/engine/permissions/internal/role/utils/are-limiting-roles-reaching-all-records.util';
import { isRolePermittingOperation } from 'src/engine/permissions/internal/role/utils/is-role-permitting-operation.util';

export const isObjectOperationDeniedToPrincipals = (
  request: PermissionsObjectAccessRequest,
): boolean =>
  !areLimitingRolesReachingAllRecords(request) ||
  (!isRolePermittingOperation(request) &&
    !canRecordShareGrantOperationToPrincipals(request));
