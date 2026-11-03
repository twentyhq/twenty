/* @license Enterprise */

import { type PermissionsRowAccessRequest } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { hasHypotheticalRecordShare } from 'src/engine/permissions/record-share/utils/has-hypothetical-record-share.util';
import { isOperationGrantedBeyondRoleToPrincipal } from 'src/engine/permissions/record-share/utils/is-operation-granted-beyond-role-to-principal.util';
import { isObjectOperationDeniedToPrincipal } from 'src/engine/permissions/role/utils/is-object-operation-denied-to-principal.util';
import { isObjectOperationDisabledToPrincipal } from 'src/engine/permissions/role/utils/is-object-operation-disabled-to-principal.util';

export const resolvePermissionsRowAccessOutcome = (
  request: PermissionsRowAccessRequest,
): boolean | undefined => {
  if (
    isObjectOperationDisabledToPrincipal(request) ||
    isObjectOperationDeniedToPrincipal(request)
  ) {
    return false;
  }

  if (
    isOperationGrantedBeyondRoleToPrincipal(request) &&
    hasHypotheticalRecordShare(request)
  ) {
    return true;
  }

  return undefined;
};
