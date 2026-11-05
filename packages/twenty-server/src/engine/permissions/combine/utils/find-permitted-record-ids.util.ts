/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsRowAccessEvaluationRequest } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { areRecordGrantsHeldToRowLevelPermissions } from 'src/engine/permissions/combine/utils/are-record-grants-held-to-row-level-permissions.util';
import { resolvePermissionsRowAccessOutcome } from 'src/engine/permissions/combine/utils/resolve-permissions-row-access-outcome.util';
import { findRecordIdsPermittedByCreator } from 'src/engine/permissions/private-record/utils/find-record-ids-permitted-by-creator.util';
import { findRecordIdsPermittedByShare } from 'src/engine/permissions/record-share/utils/find-record-ids-permitted-by-share.util';
import { findRecordIdsPermittedByRls } from 'src/engine/permissions/rls/utils/find-record-ids-permitted-by-rls.util';
import { findRowLevelPermissionMatchingRecordIds } from 'src/engine/permissions/rls/utils/find-row-level-permission-matching-record-ids.util';
import { findRecordIdsPermittedByAllRecords } from 'src/engine/permissions/all-records/utils/find-record-ids-permitted-by-all-records.util';

export const findPermittedRecordIds = async (
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

  const permittedRecordIds = new Set([
    ...(await findRecordIdsPermittedByAllRecords(request)),
    ...(await findRecordIdsPermittedByRls(request)),
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
      !permittedRecordIds.has(record.id) &&
      (!isDefined(recordGrantCandidateIds) ||
        recordGrantCandidateIds.has(record.id)),
  );

  if (remainingRecords.length === 0) {
    return permittedRecordIds;
  }

  const recordGrantRequest = { ...request, records: remainingRecords };

  return new Set([
    ...permittedRecordIds,
    ...(await findRecordIdsPermittedByShare(recordGrantRequest)),
    ...(await findRecordIdsPermittedByCreator(recordGrantRequest)),
  ]);
};
