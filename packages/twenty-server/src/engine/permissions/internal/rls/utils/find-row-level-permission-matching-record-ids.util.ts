/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsRowAccessEvaluationRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { findRecordsMatchingRecordFilter } from 'src/engine/permissions/internal/rls/utils/find-records-matching-record-filter.util';
import { resolvePermissionsRowLevelPermissionFilter } from 'src/engine/permissions/internal/rls/utils/resolve-permissions-row-level-permission-filter.util';

export const findRowLevelPermissionMatchingRecordIds = async ({
  records,
  context,
  ...request
}: PermissionsRowAccessEvaluationRequest): Promise<string[] | undefined> => {
  const recordFilter = resolvePermissionsRowLevelPermissionFilter(request);

  if (!isDefined(recordFilter)) {
    return undefined;
  }

  const matchingRecords = await findRecordsMatchingRecordFilter({
    records,
    recordFilter,
    flatObjectMetadata: request.flatObjectMetadata,
    metadataMaps: request.metadataMaps,
    findRelationJoinValues: context.findRelationJoinValues,
    shouldIgnoreSoftDeleteDefaultFilter:
      context.shouldIgnoreSoftDeleteDefaultFilter,
  });

  return matchingRecords.map((record) => record.id);
};
