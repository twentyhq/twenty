/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { getPermissionsPrincipalEphemeralRole } from 'src/engine/permissions/principal/utils/get-permissions-principal-ephemeral-role.util';
import { type PermissionsObjectAccessRequest } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { isOperationGrantedBeyondRole } from 'src/engine/permissions/record-share/utils/is-operation-granted-beyond-role.util';

// a scope bounds everything a run reaches, so shares never carry a scoped principal past its roles
export const isOperationGrantedBeyondRoleToPrincipal = ({
  principal,
  flatObjectMetadata,
  metadataMaps,
  operationType,
}: Pick<
  PermissionsObjectAccessRequest,
  'principal' | 'flatObjectMetadata' | 'metadataMaps' | 'operationType'
>): boolean =>
  !isDefined(getPermissionsPrincipalEphemeralRole(principal)) &&
  isOperationGrantedBeyondRole({
    flatObjectMetadata,
    featureFlagsMap: metadataMaps.featureFlagsMap,
    operationType,
  });
