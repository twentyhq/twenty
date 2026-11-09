/* @license Enterprise */

import { type PermissionsRowAccessRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { isOperationGrantedBeyondRoleToPrincipals } from 'src/engine/permissions/internal/record-share/utils/is-operation-granted-beyond-role-to-principals.util';

export const areRecordGrantsHeldToRowLevelPermissions = (
  request: PermissionsRowAccessRequest,
): boolean => !isOperationGrantedBeyondRoleToPrincipals(request);
