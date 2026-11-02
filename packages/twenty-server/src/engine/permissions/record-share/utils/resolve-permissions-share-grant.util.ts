/* @license Enterprise */

import { type RecordShareAccessLevel } from 'twenty-shared/types';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { type PermissionsRowAccessRequest } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { getPermissionsPrincipalShareKeys } from 'src/engine/permissions/principal/utils/get-permissions-principal-share-keys.util';
import { isRecordAccessHeldToShares } from 'src/engine/permissions/private-record/utils/is-record-access-held-to-shares.util';
import { isRecordPrivacyApplicable } from 'src/engine/permissions/private-record/utils/is-record-privacy-applicable.util';
import { isOperationGrantedBeyondRole } from 'src/engine/permissions/record-share/utils/is-operation-granted-beyond-role.util';
import { resolveRequiredRecordShareAccessLevels } from 'src/engine/permissions/record-share/utils/resolve-required-record-share-access-levels.util';

export const resolvePermissionsShareGrant = (
  request: PermissionsRowAccessRequest,
):
  | {
      principalIds: string[];
      accessLevels: RecordShareAccessLevel[];
      isLimitedToPrivateRecords: boolean;
    }
  | undefined => {
  const principalIds = getPermissionsPrincipalShareKeys(request.principal);
  const accessLevels = resolveRequiredRecordShareAccessLevels(
    request.operationType,
  );
  const isGrantedBeyondRole = isOperationGrantedBeyondRole({
    flatObjectMetadata: request.flatObjectMetadata,
    featureFlagsMap: request.metadataMaps.featureFlagsMap,
    operationType: request.operationType,
  });
  // TODO(@charlesBochet): remove with isRecordAccessHeldToShares after 2.55
  const isHeldToShares = isRecordAccessHeldToShares(request);

  if (
    !isNonEmptyArray(principalIds) ||
    !isNonEmptyArray(accessLevels) ||
    (!isGrantedBeyondRole &&
      !isHeldToShares &&
      !isRecordPrivacyApplicable(request))
  ) {
    return undefined;
  }

  return {
    principalIds,
    accessLevels,
    isLimitedToPrivateRecords: !isGrantedBeyondRole && !isHeldToShares,
  };
};
