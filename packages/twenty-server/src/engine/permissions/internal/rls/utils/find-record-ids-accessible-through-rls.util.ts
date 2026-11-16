/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsRowAccessEvaluationRequest } from 'src/engine/permissions/internal/combine/types/permissions-access-request.type';
import { canRlsAccessOperation } from 'src/engine/permissions/internal/rls/utils/can-rls-access-operation.util';
import { findRecordsMatchingRecordFilter } from 'src/engine/permissions/internal/rls/utils/find-records-matching-record-filter.util';
import { resolveRlsRuleRecordFilter } from 'src/engine/permissions/internal/rls/utils/resolve-rls-rule-record-filter.util';

export const findRecordIdsAccessibleThroughRls = async (
  request: Pick<
    PermissionsRowAccessEvaluationRequest,
    | 'principals'
    | 'metadataMaps'
    | 'flatObjectMetadata'
    | 'operationType'
    | 'records'
    | 'context'
  >,
): Promise<string[]> => {
  if (!canRlsAccessOperation(request)) {
    return [];
  }

  const rlsRuleRecordFilter = resolveRlsRuleRecordFilter(request);

  if (!isDefined(rlsRuleRecordFilter)) {
    return [];
  }

  const matchingRecords = await findRecordsMatchingRecordFilter({
    records: request.records,
    recordFilter: rlsRuleRecordFilter,
    flatObjectMetadata: request.flatObjectMetadata,
    metadataMaps: request.metadataMaps,
    findRelationJoinValues: request.context.findRelationJoinValues,
    shouldIgnoreSoftDeleteDefaultFilter:
      request.context.shouldIgnoreSoftDeleteDefaultFilter,
  });
  return matchingRecords.map((record) => record.id);
};
