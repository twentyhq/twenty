/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsRowAccessEvaluationRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { resolvePermissionsRowLevelPermissionFilter } from 'src/engine/permissions/internal/rls/utils/resolve-permissions-row-level-permission-filter.util';
import { isRecordMatchingFilter } from 'src/engine/permissions/utils/is-record-matching-filter.util';

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
      isRecordMatchingFilter({
        record,
        filter: rowLevelPermissionFilter.recordFilter,
        flatObjectMetadata: request.flatObjectMetadata,
        flatFieldMetadataMaps: request.metadataMaps.flatFieldMetadataMaps,
        shouldIgnoreSoftDeleteDefaultFilter:
          context.shouldIgnoreSoftDeleteDefaultFilter,
      }),
    )
    .map((record) => record.id);
};
