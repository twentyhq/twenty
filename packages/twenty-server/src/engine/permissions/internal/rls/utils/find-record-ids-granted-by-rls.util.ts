/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsRowAccessEvaluationRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { findRecordIdsByPrivacy } from 'src/engine/permissions/internal/private-record/utils/find-record-ids-by-privacy.util';
import { areRoleGrantsLimitedToPublicRecords } from 'src/engine/permissions/internal/role/utils/are-role-grants-limited-to-public-records.util';

export const findRecordIdsGrantedByRls = async ({
  matchingRecordIds,
  ...request
}: PermissionsRowAccessEvaluationRequest & {
  matchingRecordIds: string[] | undefined;
}): Promise<string[]> => {
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
