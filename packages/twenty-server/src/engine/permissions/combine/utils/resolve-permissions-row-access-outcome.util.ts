/* @license Enterprise */

import { type PermissionsRowAccessRequest } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { hasHypotheticalRecordShare } from 'src/engine/permissions/record-share/utils/has-hypothetical-record-share.util';
import { isOperationGrantedBeyondRoleToPrincipals } from 'src/engine/permissions/record-share/utils/is-operation-granted-beyond-role-to-principals.util';
import { isObjectOperationDeniedToPrincipals } from 'src/engine/permissions/role/utils/is-object-operation-denied-to-principals.util';
import { isObjectOperationDisabledToPrincipals } from 'src/engine/permissions/role/utils/is-object-operation-disabled-to-principals.util';

export const resolvePermissionsRowAccessOutcome = (
  request: PermissionsRowAccessRequest,
): boolean | undefined => {
  if (
    isObjectOperationDisabledToPrincipals(request) ||
    isObjectOperationDeniedToPrincipals(request)
  ) {
    return false;
  }

  if (
    isOperationGrantedBeyondRoleToPrincipals(request) &&
    hasHypotheticalRecordShare(request)
  ) {
    return true;
  }

  return undefined;
};
