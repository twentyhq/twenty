/* @license Enterprise */

import { type PermissionsRowAccessRequest } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { isOperationGrantedBeyondRoleToPrincipal } from 'src/engine/permissions/record-share/utils/is-operation-granted-beyond-role-to-principal.util';

export const areRecordGrantsHeldToRowLevelPermissions = (
  request: PermissionsRowAccessRequest,
): boolean => !isOperationGrantedBeyondRoleToPrincipal(request);
