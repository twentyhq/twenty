/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsRowAccessEvaluationRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { resolveRelationsInRecordFilter } from 'src/engine/permissions/internal/rls/utils/resolve-relations-in-record-filter.util';
import { resolvePermissionsRowLevelPermissionFilter } from 'src/engine/permissions/internal/rls/utils/resolve-permissions-row-level-permission-filter.util';
import { isRecordMatchingFilter } from 'src/engine/permissions/utils/is-record-matching-filter.util';

export const findRowLevelPermissionMatchingRecordIds = async ({
  records,
  context,
  ...request
}: PermissionsRowAccessEvaluationRequest): Promise<string[] | undefined> => {
  const rowLevelPermissionFilter = resolvePermissionsRowLevelPermissionFilter({
    ...request,
    tableAlias: request.flatObjectMetadata.nameSingular,
  });

  if (!isDefined(rowLevelPermissionFilter)) {
    return undefined;
  }

  const recordFilter = await resolveRelationsInRecordFilter({
    recordFilter: rowLevelPermissionFilter.recordFilter,
    flatObjectMetadata: request.flatObjectMetadata,
    records,
    metadataMaps: request.metadataMaps,
    findRelationJoinValues: context.findRelationJoinValues,
  });

  return records
    .filter((record) =>
      isRecordMatchingFilter({
        record,
        filter: recordFilter,
        flatObjectMetadata: request.flatObjectMetadata,
        flatFieldMetadataMaps: request.metadataMaps.flatFieldMetadataMaps,
        shouldIgnoreSoftDeleteDefaultFilter:
          context.shouldIgnoreSoftDeleteDefaultFilter,
      }),
    )
    .map((record) => record.id);
};
