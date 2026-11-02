/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsRowAccessEvaluationRequest } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { areRecordGrantsHeldToRowLevelPermissions } from 'src/engine/permissions/combine/utils/are-record-grants-held-to-row-level-permissions.util';
import { resolvePermissionsRowAccessOutcome } from 'src/engine/permissions/combine/utils/resolve-permissions-row-access-outcome.util';
import { findPermissionsCreatorAdmittedRecordIds } from 'src/engine/permissions/private-record/utils/find-permissions-creator-admitted-record-ids.util';
import { findPermissionsShareAdmittedRecordIds } from 'src/engine/permissions/record-share/utils/find-permissions-share-admitted-record-ids.util';
import { findPermissionsRlsAdmittedRecordIds } from 'src/engine/permissions/rls/utils/find-permissions-rls-admitted-record-ids.util';
import { findRowLevelPermissionMatchingRecordIds } from 'src/engine/permissions/rls/utils/find-row-level-permission-matching-record-ids.util';
import { findPermissionsObjectAdmittedRecordIds } from 'src/engine/permissions/role/utils/find-permissions-object-admitted-record-ids.util';

export const findPermissionsAdmittedRecordIds = async (
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

  const admittedRecordIds = new Set([
    ...(await findPermissionsObjectAdmittedRecordIds(request)),
    ...(await findPermissionsRlsAdmittedRecordIds(request)),
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
      !admittedRecordIds.has(record.id) &&
      (!isDefined(recordGrantCandidateIds) ||
        recordGrantCandidateIds.has(record.id)),
  );

  if (remainingRecords.length === 0) {
    return admittedRecordIds;
  }

  const recordGrantRequest = { ...request, records: remainingRecords };

  return new Set([
    ...admittedRecordIds,
    ...(await findPermissionsShareAdmittedRecordIds(recordGrantRequest)),
    ...(await findPermissionsCreatorAdmittedRecordIds(recordGrantRequest)),
  ]);
};
