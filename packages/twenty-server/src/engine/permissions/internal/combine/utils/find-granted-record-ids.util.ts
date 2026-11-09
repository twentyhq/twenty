/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsRowAccessEvaluationRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { areRecordGrantsHeldToRowLevelPermissions } from 'src/engine/permissions/internal/combine/utils/are-record-grants-held-to-row-level-permissions.util';
import { resolvePermissionsRowAccessOutcome } from 'src/engine/permissions/internal/combine/utils/resolve-permissions-row-access-outcome.util';
import { findRecordIdsGrantedByCreator } from 'src/engine/permissions/internal/private-record/utils/find-record-ids-granted-by-creator.util';
import { findRecordIdsGrantedByShare } from 'src/engine/permissions/internal/record-share/utils/find-record-ids-granted-by-share.util';
import { findRecordIdsGrantedByRls } from 'src/engine/permissions/internal/rls/utils/find-record-ids-granted-by-rls.util';
import { findRowLevelPermissionMatchingRecordIds } from 'src/engine/permissions/internal/rls/utils/find-row-level-permission-matching-record-ids.util';
import { findRecordIdsGrantedByAllRecords } from 'src/engine/permissions/internal/all-records/utils/find-record-ids-granted-by-all-records.util';

export const findGrantedRecordIds = async (
  request: PermissionsRowAccessEvaluationRequest,
): Promise<Set<string>> => {
  const { records } = request;
  const outcome = resolvePermissionsRowAccessOutcome(request);

  if (outcome === false || records.length === 0) {
    return new Set();
  }

  if (outcome === true) {
    return new Set(records.map((record) => record.id));
  }

  const roleGrantedRecordIds = new Set([
    ...(await findRecordIdsGrantedByAllRecords(request)),
    ...(await findRecordIdsGrantedByRls(request)),
  ]);
  const rowLevelPermissionMatchingRecordIds =
    areRecordGrantsHeldToRowLevelPermissions(request)
      ? findRowLevelPermissionMatchingRecordIds(request)
      : undefined;
  const recordGrantCandidateIds = isDefined(rowLevelPermissionMatchingRecordIds)
    ? new Set(rowLevelPermissionMatchingRecordIds)
    : undefined;
  const remainingRecords = records.filter(
    (record) =>
      !roleGrantedRecordIds.has(record.id) &&
      (!isDefined(recordGrantCandidateIds) ||
        recordGrantCandidateIds.has(record.id)),
  );

  if (remainingRecords.length === 0) {
    return roleGrantedRecordIds;
  }

  const recordGrantRequest = { ...request, records: remainingRecords };

  return new Set([
    ...roleGrantedRecordIds,
    ...(await findRecordIdsGrantedByShare(recordGrantRequest)),
    ...(await findRecordIdsGrantedByCreator(recordGrantRequest)),
  ]);
};
