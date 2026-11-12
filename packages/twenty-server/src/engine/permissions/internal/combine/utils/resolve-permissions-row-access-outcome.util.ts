/* @license Enterprise */

import { type PermissionsRowAccessRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { hasHypotheticalRecordShare } from 'src/engine/permissions/internal/record-share/utils/has-hypothetical-record-share.util';
import { canRecordShareGrantOperation } from 'src/engine/permissions/internal/record-share/utils/can-record-share-grant-operation.util';
import { isObjectOperationDeniedToPrincipals } from 'src/engine/permissions/internal/combine/utils/is-object-operation-denied-to-principals.util';
import { isObjectOperationDisabledToPrincipals } from 'src/engine/permissions/internal/role/utils/is-object-operation-disabled-to-principals.util';

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
    canRecordShareGrantOperation({
      flatObjectMetadata: request.flatObjectMetadata,
      featureFlagsMap: request.metadataMaps.featureFlagsMap,
      operationType: request.operationType,
    }) &&
    hasHypotheticalRecordShare(request)
  ) {
    return true;
  }

  return undefined;
};
