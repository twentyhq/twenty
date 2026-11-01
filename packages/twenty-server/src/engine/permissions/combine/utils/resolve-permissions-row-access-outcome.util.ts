/* @license Enterprise */

import { type PermissionsRowAccessRequest } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { hasHypotheticalRecordShare } from 'src/engine/permissions/record-share/utils/has-hypothetical-record-share.util';
import { isOperationGrantedBeyondRole } from 'src/engine/permissions/record-share/utils/is-operation-granted-beyond-role.util';
import { isObjectOperationDisabled } from 'src/engine/permissions/role/utils/is-object-operation-disabled.util';
import { isRolePermittingOperation } from 'src/engine/permissions/role/utils/is-role-permitting-operation.util';

// true admits every record, false none; undefined leaves it to the grant paths
export const resolvePermissionsRowAccessOutcome = (
  request: PermissionsRowAccessRequest,
): boolean | undefined => {
  const { subject, environment, flatObjectMetadata, operationType } = request;

  if (subject.isSystemContext) {
    return true;
  }

  if (
    isObjectOperationDisabled({
      objectMetadata: flatObjectMetadata,
      operationType,
    }) &&
    !subject.isOwningApplication(flatObjectMetadata)
  ) {
    return false;
  }

  const isGrantedBeyondRole = isOperationGrantedBeyondRole({
    flatObjectMetadata,
    featureFlagsMap: environment.featureFlagsMap,
    operationType,
  });

  if (!isRolePermittingOperation(request) && !isGrantedBeyondRole) {
    return false;
  }

  if (isGrantedBeyondRole && hasHypotheticalRecordShare(request)) {
    return true;
  }

  return undefined;
};
