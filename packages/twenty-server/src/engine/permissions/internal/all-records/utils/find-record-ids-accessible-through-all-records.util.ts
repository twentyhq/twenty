/* @license Enterprise */

import { canAllRecordsAccessOperation } from 'src/engine/permissions/internal/all-records/utils/can-all-records-access-operation.util';
import { type PermissionsRowAccessEvaluationRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { arePrivateRecordsExcludedFromAllRecordsAndRls } from 'src/engine/permissions/internal/private-record/utils/are-private-records-excluded-from-all-records-and-rls.util';
import { findRecordIdsByPrivacy } from 'src/engine/permissions/internal/private-record/utils/find-record-ids-by-privacy.util';

export const findRecordIdsAccessibleThroughAllRecords = async (
  request: PermissionsRowAccessEvaluationRequest,
): Promise<string[]> => {
  if (!canAllRecordsAccessOperation(request)) {
    return [];
  }

  const recordIds = request.records.map((record) => record.id);

  if (!arePrivateRecordsExcludedFromAllRecordsAndRls(request)) {
    return recordIds;
  }

  return findRecordIdsByPrivacy({
    recordIds,
    flatObjectMetadata: request.flatObjectMetadata,
    context: request.context,
    isPrivate: false,
  });
};
