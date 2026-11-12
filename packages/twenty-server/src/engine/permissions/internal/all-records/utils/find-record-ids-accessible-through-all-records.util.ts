/* @license Enterprise */

import { canAllRecordsAccessOperation } from 'src/engine/permissions/internal/all-records/utils/can-all-records-access-operation.util';
import { type PermissionsRowAccessEvaluationRequest } from 'src/engine/permissions/internal/combine/types/permissions-access-request.type';

export const findRecordIdsAccessibleThroughAllRecords = (
  request: PermissionsRowAccessEvaluationRequest,
): string[] =>
  canAllRecordsAccessOperation(request)
    ? request.records.map((record) => record.id)
    : [];
