/* @license Enterprise */

import { type RecordGqlOperationFilter } from 'twenty-shared/types';

import { type PermissionsRowAccessEvaluationRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { findRecordsMatchingRecordFilter } from 'src/engine/permissions/internal/rls/utils/find-records-matching-record-filter.util';

export const findRowLevelPermissionMatchingRecordIds = async ({
  request,
  rlsRuleFilter,
}: {
  request: Pick<
    PermissionsRowAccessEvaluationRequest,
    'records' | 'flatObjectMetadata' | 'metadataMaps' | 'context'
  >;
  rlsRuleFilter: RecordGqlOperationFilter;
}): Promise<string[]> => {
  const matchingRecords = await findRecordsMatchingRecordFilter({
    records: request.records,
    recordFilter: rlsRuleFilter,
    flatObjectMetadata: request.flatObjectMetadata,
    metadataMaps: request.metadataMaps,
    findRelationJoinValues: request.context.findRelationJoinValues,
    shouldIgnoreSoftDeleteDefaultFilter:
      request.context.shouldIgnoreSoftDeleteDefaultFilter,
  });

  return matchingRecords.map((record) => record.id);
};
