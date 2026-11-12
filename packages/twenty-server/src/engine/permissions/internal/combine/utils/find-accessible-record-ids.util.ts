/* @license Enterprise */

import { findRecordIdsAccessibleThroughAllRecords } from 'src/engine/permissions/internal/all-records/utils/find-record-ids-accessible-through-all-records.util';
import { type PermissionsRowAccessEvaluationRequest } from 'src/engine/permissions/internal/combine/types/permissions-access-request.type';
import { resolveRowAccessOutcome } from 'src/engine/permissions/internal/combine/utils/resolve-row-access-outcome.util';
import { arePrivateRecordsExcludedFromAllRecordsAndRls } from 'src/engine/permissions/internal/private-record/utils/are-private-records-excluded-from-all-records-and-rls.util';
import { findRecordIdsByPrivateRecordState } from 'src/engine/permissions/internal/private-record/utils/find-record-ids-by-private-record-state.util';
import { findRecordIdsAccessibleThroughPrivateRecord } from 'src/engine/permissions/internal/private-record/utils/find-record-ids-accessible-through-private-record.util';
import { findRecordIdsAccessibleThroughRecordShare } from 'src/engine/permissions/internal/record-share/utils/find-record-ids-accessible-through-record-share.util';
import { findRecordIdsAccessibleThroughRls } from 'src/engine/permissions/internal/rls/utils/find-record-ids-accessible-through-rls.util';

export const findAccessibleRecordIds = async (
  request: PermissionsRowAccessEvaluationRequest,
): Promise<Set<string>> => {
  const { records } = request;
  const outcome = resolveRowAccessOutcome(request);

  if (outcome === false || records.length === 0) {
    return new Set();
  }

  if (outcome === true) {
    return new Set(records.map((record) => record.id));
  }

  const allRecordsOrRlsRecordIds = [
    ...new Set([
      ...findRecordIdsAccessibleThroughAllRecords(request),
      ...(await findRecordIdsAccessibleThroughRls(request)),
    ]),
  ];
  const allRecordsOrRlsAccessibleRecordIds = new Set(
    arePrivateRecordsExcludedFromAllRecordsAndRls(request)
      ? await findRecordIdsByPrivateRecordState({
          recordIds: allRecordsOrRlsRecordIds,
          flatObjectMetadata: request.flatObjectMetadata,
          context: request.context,
          isPrivate: false,
        })
      : allRecordsOrRlsRecordIds,
  );
  const remainingRecords = records.filter(
    (record) => !allRecordsOrRlsAccessibleRecordIds.has(record.id),
  );

  if (remainingRecords.length === 0) {
    return allRecordsOrRlsAccessibleRecordIds;
  }

  const remainingRecordsRequest = { ...request, records: remainingRecords };

  return new Set([
    ...allRecordsOrRlsAccessibleRecordIds,
    ...(await findRecordIdsAccessibleThroughRecordShare(
      remainingRecordsRequest,
    )),
    ...(await findRecordIdsAccessibleThroughPrivateRecord(
      remainingRecordsRequest,
    )),
  ]);
};
