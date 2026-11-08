/* @license Enterprise */

import { type PermissionsObjectAccessRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { isOperationGrantedBeyondRoleToPrincipals } from 'src/engine/permissions/internal/record-share/utils/is-operation-granted-beyond-role-to-principals.util';
import { isRolePermittingOperation } from 'src/engine/permissions/internal/role/utils/is-role-permitting-operation.util';

export const isObjectOperationDeniedToPrincipals = (
  request: PermissionsObjectAccessRequest,
): boolean =>
  !isRolePermittingOperation(request) &&
  !isOperationGrantedBeyondRoleToPrincipals(request);
