/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsRowAccessEvaluationRequest } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { resolvePermissionsRowLevelPermissionFilter } from 'src/engine/permissions/rls/utils/resolve-permissions-row-level-permission-filter.util';
import { isRecordMatchingRLSRowLevelPermissionPredicate } from 'src/engine/permissions/rls/utils/is-record-matching-rls-row-level-permission-predicate.util';

export const findRowLevelPermissionMatchingRecordIds = ({
  records,
  context,
  ...request
}: PermissionsRowAccessEvaluationRequest): string[] | undefined => {
  const rowLevelPermissionFilter = resolvePermissionsRowLevelPermissionFilter({
    ...request,
    tableAlias: request.flatObjectMetadata.nameSingular,
  });

  if (!isDefined(rowLevelPermissionFilter)) {
    return undefined;
  }

  return records
    .filter((record) =>
      isRecordMatchingRLSRowLevelPermissionPredicate({
        record,
        filter: rowLevelPermissionFilter.recordFilter,
        flatObjectMetadata: request.flatObjectMetadata,
        flatFieldMetadataMaps: request.environment.flatFieldMetadataMaps,
        shouldIgnoreSoftDeleteDefaultFilter:
          context.shouldIgnoreSoftDeleteDefaultFilter,
      }),
    )
    .map((record) => record.id);
};
