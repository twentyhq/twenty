/* @license Enterprise */

import { type PermissionsRowAccessRequest } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { isPermissionsPrincipalOwningObject } from 'src/engine/permissions/principal/utils/is-permissions-principal-owning-object.util';
import { hasHypotheticalRecordShare } from 'src/engine/permissions/record-share/utils/has-hypothetical-record-share.util';
import { isOperationGrantedBeyondRole } from 'src/engine/permissions/record-share/utils/is-operation-granted-beyond-role.util';
import { isObjectOperationDeniedToPrincipal } from 'src/engine/permissions/role/utils/is-object-operation-denied-to-principal.util';
import { isObjectOperationDisabled } from 'src/engine/permissions/role/utils/is-object-operation-disabled.util';

export const resolvePermissionsRowAccessOutcome = (
  request: PermissionsRowAccessRequest,
): boolean | undefined => {
  const { principal, environment, flatObjectMetadata, operationType } = request;

  if (
    isObjectOperationDisabled({
      objectMetadata: flatObjectMetadata,
      operationType,
    }) &&
    !isPermissionsPrincipalOwningObject({
      principal,
      flatApplicationMaps: environment.flatApplicationMaps,
      flatObjectMetadata,
    })
  ) {
    return false;
  }

  if (isObjectOperationDeniedToPrincipal(request)) {
    return false;
  }

  if (
    isOperationGrantedBeyondRole({
      flatObjectMetadata,
      featureFlagsMap: environment.featureFlagsMap,
      operationType,
    }) &&
    hasHypotheticalRecordShare(request)
  ) {
    return true;
  }

  return undefined;
};
