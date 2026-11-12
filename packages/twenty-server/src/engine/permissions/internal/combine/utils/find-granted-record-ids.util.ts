/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsRowAccessEvaluationRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { resolvePermissionsRowAccessOutcome } from 'src/engine/permissions/internal/combine/utils/resolve-permissions-row-access-outcome.util';
import { findRecordIdsGrantedByCreator } from 'src/engine/permissions/internal/private-record/utils/find-record-ids-granted-by-creator.util';
import { findRecordIdsGrantedByShare } from 'src/engine/permissions/internal/record-share/utils/find-record-ids-granted-by-share.util';
import { findRecordIdsGrantedByAllRecordsOrRowLevelPermissions } from 'src/engine/permissions/internal/combine/utils/find-record-ids-granted-by-all-records-or-row-level-permissions.util';
import { findRowLevelPermissionMatchingRecordIds } from 'src/engine/permissions/internal/combine/utils/find-row-level-permission-matching-record-ids.util';
import { resolvePermissionsRowLevelPermissionFilter } from 'src/engine/permissions/internal/combine/utils/resolve-permissions-row-level-permission-filter.util';

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

  const rlsRuleFilter = resolvePermissionsRowLevelPermissionFilter(request);
  const rlsRuleMatchingRecordIds = isDefined(rlsRuleFilter)
    ? await findRowLevelPermissionMatchingRecordIds({ request, rlsRuleFilter })
    : undefined;
  const allRecordsOrRowLevelPermissionsGrantedRecordIds = new Set(
    await findRecordIdsGrantedByAllRecordsOrRowLevelPermissions({
      request,
      rlsRuleMatchingRecordIds,
    }),
  );
  const remainingRecords = records.filter(
    (record) => !allRecordsOrRowLevelPermissionsGrantedRecordIds.has(record.id),
  );

  if (remainingRecords.length === 0) {
    return allRecordsOrRowLevelPermissionsGrantedRecordIds;
  }

  const recordGrantRequest = { ...request, records: remainingRecords };

  return new Set([
    ...allRecordsOrRowLevelPermissionsGrantedRecordIds,
    ...(await findRecordIdsGrantedByShare(recordGrantRequest)),
    ...(await findRecordIdsGrantedByCreator(recordGrantRequest)),
  ]);
};
