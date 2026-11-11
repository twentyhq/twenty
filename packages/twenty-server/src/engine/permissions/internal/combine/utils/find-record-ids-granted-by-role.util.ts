/* @license Enterprise */

import { type PermissionsRowAccessEvaluationRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { areRoleGrantsLimitedToPublicRecords } from 'src/engine/permissions/internal/combine/utils/are-role-grants-limited-to-public-records.util';
import { findRecordIdsByPrivacy } from 'src/engine/permissions/internal/private-record/utils/find-record-ids-by-privacy.util';
import { canAllRecordsOrRowLevelPermissionsGrantOperation } from 'src/engine/permissions/internal/role/utils/can-all-records-or-row-level-permissions-grant-operation.util';

export const findRecordIdsGrantedByRole = async ({
  request,
  rlsRuleMatchingRecordIds,
}: {
  request: PermissionsRowAccessEvaluationRequest;
  rlsRuleMatchingRecordIds: string[] | undefined;
}): Promise<string[]> => {
  if (!canAllRecordsOrRowLevelPermissionsGrantOperation(request)) {
    return [];
  }

  const recordIds =
    rlsRuleMatchingRecordIds ?? request.records.map((record) => record.id);

  if (!areRoleGrantsLimitedToPublicRecords(request)) {
    return recordIds;
  }

  return findRecordIdsByPrivacy({
    recordIds,
    flatObjectMetadata: request.flatObjectMetadata,
    context: request.context,
    isPrivate: false,
  });
};
