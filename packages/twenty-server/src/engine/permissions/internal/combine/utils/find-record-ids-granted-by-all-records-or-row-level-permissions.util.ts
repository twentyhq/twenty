/* @license Enterprise */

import { type PermissionsRowAccessEvaluationRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { areAllRecordsOrRowLevelPermissionsLimitedToPublicRecords } from 'src/engine/permissions/internal/combine/utils/are-all-records-or-row-level-permissions-limited-to-public-records.util';
import { findRecordIdsByPrivacy } from 'src/engine/permissions/internal/private-record/utils/find-record-ids-by-privacy.util';
import { canAllRecordsOrRowLevelPermissionsGrantOperation } from 'src/engine/permissions/internal/role/utils/can-all-records-or-row-level-permissions-grant-operation.util';

export const findRecordIdsGrantedByAllRecordsOrRowLevelPermissions = async ({
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

  if (!areAllRecordsOrRowLevelPermissionsLimitedToPublicRecords(request)) {
    return recordIds;
  }

  return findRecordIdsByPrivacy({
    recordIds,
    flatObjectMetadata: request.flatObjectMetadata,
    context: request.context,
    isPrivate: false,
  });
};
