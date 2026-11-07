/* @license Enterprise */

import {
  FeatureFlagKey,
  type RecordShareAccessLevel,
} from 'twenty-shared/types';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { type PermissionsRowAccessRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { isPrivateByDefaultObject } from 'src/engine/permissions/private-record/utils/is-private-by-default-object.util';
import { getPermissionsPrincipalsShareKeys } from 'src/engine/permissions/internal/principal/utils/get-permissions-principals-share-keys.util';
import { isRecordPrivacyApplicable } from 'src/engine/permissions/internal/private-record/utils/is-record-privacy-applicable.util';
import { isOperationGrantedBeyondRoleToPrincipals } from 'src/engine/permissions/internal/record-share/utils/is-operation-granted-beyond-role-to-principals.util';
import { resolveRequiredRecordShareAccessLevels } from 'src/engine/permissions/internal/record-share/utils/resolve-required-record-share-access-levels.util';

// Private by default objects always apply shares, whichever flag is off
const isRecordShareReadEnabled = ({
  flatObjectMetadata,
  metadataMaps: { featureFlagsMap },
}: PermissionsRowAccessRequest): boolean =>
  isPrivateByDefaultObject(flatObjectMetadata) ||
  (featureFlagsMap[FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED] ?? false);

export const resolvePermissionsShareGrant = (
  request: PermissionsRowAccessRequest,
):
  | {
      principalIds: string[];
      accessLevels: RecordShareAccessLevel[];
      isLimitedToPrivateRecords: boolean;
    }
  | undefined => {
  const principalIds = getPermissionsPrincipalsShareKeys(request.principals);
  const accessLevels = resolveRequiredRecordShareAccessLevels(
    request.operationType,
  );
  const isGrantedBeyondRole = isOperationGrantedBeyondRoleToPrincipals(request);

  if (
    !isNonEmptyArray(principalIds) ||
    !isNonEmptyArray(accessLevels) ||
    (!isGrantedBeyondRole &&
      !(
        isRecordPrivacyApplicable(request) && isRecordShareReadEnabled(request)
      ))
  ) {
    return undefined;
  }

  return {
    principalIds,
    accessLevels,
    isLimitedToPrivateRecords: !isGrantedBeyondRole,
  };
};
