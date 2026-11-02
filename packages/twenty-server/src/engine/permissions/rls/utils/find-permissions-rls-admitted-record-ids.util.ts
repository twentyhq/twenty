/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsRowAccessEvaluationRequest } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { findRecordIdsByPrivacy } from 'src/engine/permissions/private-record/utils/find-record-ids-by-privacy.util';
import { areRoleGrantsLimitedToPublicRecords } from 'src/engine/permissions/role/utils/are-role-grants-limited-to-public-records.util';
import { findRowLevelPermissionMatchingRecordIds } from 'src/engine/permissions/rls/utils/find-row-level-permission-matching-record-ids.util';

export const findPermissionsRlsAdmittedRecordIds = async (
  request: PermissionsRowAccessEvaluationRequest,
): Promise<string[]> => {
  const matchingRecordIds = findRowLevelPermissionMatchingRecordIds(request);

  if (!isDefined(matchingRecordIds)) {
    return [];
  }

  return areRoleGrantsLimitedToPublicRecords(request)
    ? findRecordIdsByPrivacy({
        recordIds: matchingRecordIds,
        flatObjectMetadata: request.flatObjectMetadata,
        context: request.context,
        isPrivate: false,
      })
    : matchingRecordIds;
};
