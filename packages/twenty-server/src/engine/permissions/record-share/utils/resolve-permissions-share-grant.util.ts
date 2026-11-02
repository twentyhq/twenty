/* @license Enterprise */

import { type RecordShareAccessLevel } from 'twenty-shared/types';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { type PermissionsRowAccessRequest } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { getPermissionsPrincipalShareKeys } from 'src/engine/permissions/principal/utils/get-permissions-principal-share-keys.util';
import { isShareOnlyWhilePrivateRecordFlagDisabled } from 'src/engine/permissions/private-record/utils/is-share-only-while-private-record-flag-disabled.util';
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
  // TODO(@charlesBochet): remove with isShareOnlyWhilePrivateRecordFlagDisabled after 2.55
  const isShareOnly = isShareOnlyWhilePrivateRecordFlagDisabled(request);

  if (
    !isNonEmptyArray(principalIds) ||
    !isNonEmptyArray(accessLevels) ||
    (!isGrantedBeyondRole &&
      !isShareOnly &&
      !isRecordPrivacyApplicable(request))
  ) {
    return undefined;
  }

  return {
    principalIds,
    accessLevels,
    isLimitedToPrivateRecords: !isGrantedBeyondRole && !isShareOnly,
  };
};
