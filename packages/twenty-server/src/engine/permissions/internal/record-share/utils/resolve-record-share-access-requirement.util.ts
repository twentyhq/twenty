/* @license Enterprise */

import { type RecordShareAccessLevel } from 'twenty-shared/types';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { type PermissionsRowAccessRequest } from 'src/engine/permissions/internal/combine/types/permissions-access-request.type';
import { getPermissionsPrincipalsShareKeys } from 'src/engine/permissions/internal/principal/utils/get-permissions-principals-share-keys.util';
import { canRecordShareAccessOperation } from 'src/engine/permissions/internal/record-share/utils/can-record-share-access-operation.util';
import { resolveRequiredRecordShareAccessLevels } from 'src/engine/permissions/internal/record-share/utils/resolve-required-record-share-access-levels.util';

export const resolveRecordShareAccessRequirement = (
  request: PermissionsRowAccessRequest,
):
  | {
      principalIds: string[];
      accessLevels: RecordShareAccessLevel[];
    }
  | undefined => {
  const principalIds = getPermissionsPrincipalsShareKeys(request.principals);
  const accessLevels = resolveRequiredRecordShareAccessLevels(
    request.operationType,
  );

  if (
    !isNonEmptyArray(principalIds) ||
    !isNonEmptyArray(accessLevels) ||
    !canRecordShareAccessOperation({
      flatObjectMetadata: request.flatObjectMetadata,
      featureFlagsMap: request.metadataMaps.featureFlagsMap,
      operationType: request.operationType,
    })
  ) {
    return undefined;
  }

  return { principalIds, accessLevels };
};
