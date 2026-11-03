/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsRowAccessEvaluationRequest } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { areRecordGrantsHeldToRowLevelPermissions } from 'src/engine/permissions/combine/utils/are-record-grants-held-to-row-level-permissions.util';
import { resolvePermissionsRowAccessOutcome } from 'src/engine/permissions/combine/utils/resolve-permissions-row-access-outcome.util';
import { getObjectRowAccessPolicy } from 'src/engine/permissions/row-policy/utils/get-object-row-access-policy.util';
import { findPermissionsCreatorAdmittedRecordIds } from 'src/engine/permissions/private-record/utils/find-permissions-creator-admitted-record-ids.util';
import { isShareOnlyWhilePrivateRecordFlagDisabled } from 'src/engine/permissions/private-record/utils/is-share-only-while-private-record-flag-disabled.util';
import { findPermissionsShareAdmittedRecordIds } from 'src/engine/permissions/record-share/utils/find-permissions-share-admitted-record-ids.util';
import { findPermissionsRlsAdmittedRecordIds } from 'src/engine/permissions/rls/utils/find-permissions-rls-admitted-record-ids.util';
import { findRowLevelPermissionMatchingRecordIds } from 'src/engine/permissions/rls/utils/find-row-level-permission-matching-record-ids.util';
import { findPermissionsObjectAdmittedRecordIds } from 'src/engine/permissions/role/utils/find-permissions-object-admitted-record-ids.util';

export const findPermissionsAdmittedRecordIds = async (
  request: PermissionsRowAccessEvaluationRequest,
): Promise<Set<string>> => {
  const outcome = resolvePermissionsRowAccessOutcome(request);

  if (outcome === false || request.records.length === 0) {
    return new Set();
  }

  const objectPolicy = getObjectRowAccessPolicy(request.flatObjectMetadata);
  const policyAdmittedRecordIds =
    request.preAdmittedRecordIds ??
    (await objectPolicy?.findAdmittedRecordIds(request));
  const records = isDefined(policyAdmittedRecordIds)
    ? request.records.filter(({ id }) => policyAdmittedRecordIds.has(id))
    : request.records;
  const admittedRequest = { ...request, records };

  if (outcome === true) {
    return new Set(records.map((record) => record.id));
  }

  // TODO(@charlesBochet): remove with isShareOnlyWhilePrivateRecordFlagDisabled after 2.55
  const admittedRecordIds = isShareOnlyWhilePrivateRecordFlagDisabled(request)
    ? new Set<string>()
    : new Set([
        ...(await findPermissionsObjectAdmittedRecordIds(admittedRequest)),
        ...(await findPermissionsRlsAdmittedRecordIds(admittedRequest)),
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

  const recordGrantRequest = { ...admittedRequest, records: remainingRecords };

  return new Set([
    ...admittedRecordIds,
    ...(await findPermissionsShareAdmittedRecordIds(recordGrantRequest)),
    ...(await findPermissionsCreatorAdmittedRecordIds(recordGrantRequest)),
  ]);
};
