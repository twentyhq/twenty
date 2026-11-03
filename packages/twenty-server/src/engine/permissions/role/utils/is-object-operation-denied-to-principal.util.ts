/* @license Enterprise */

import { type PermissionsObjectAccessRequest } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { isOperationGrantedBeyondRoleToPrincipal } from 'src/engine/permissions/record-share/utils/is-operation-granted-beyond-role-to-principal.util';
import { isRolePermittingOperation } from 'src/engine/permissions/role/utils/is-role-permitting-operation.util';

export const isObjectOperationDeniedToPrincipal = (
  request: PermissionsObjectAccessRequest,
): boolean =>
  !isRolePermittingOperation(request) &&
  !isOperationGrantedBeyondRoleToPrincipal(request);
