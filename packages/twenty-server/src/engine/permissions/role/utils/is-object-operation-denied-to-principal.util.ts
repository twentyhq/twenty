/* @license Enterprise */

import { type PermissionsRowAccessRequest } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { isOperationGrantedBeyondRole } from 'src/engine/permissions/record-share/utils/is-operation-granted-beyond-role.util';
import { isRolePermittingOperation } from 'src/engine/permissions/role/utils/is-role-permitting-operation.util';

export const isObjectOperationDeniedToPrincipal = (
  request: Pick<
    PermissionsRowAccessRequest,
    'principal' | 'metadataMaps' | 'flatObjectMetadata' | 'operationType'
  >,
): boolean =>
  !isRolePermittingOperation(request) &&
  !isOperationGrantedBeyondRole({
    flatObjectMetadata: request.flatObjectMetadata,
    featureFlagsMap: request.metadataMaps.featureFlagsMap,
    operationType: request.operationType,
  });
