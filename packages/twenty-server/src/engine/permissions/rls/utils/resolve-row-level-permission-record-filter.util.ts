/* @license Enterprise */

import { type RecordGqlOperationFilter } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type PermissionsMetadataMaps } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { type PermissionsPrincipal } from 'src/engine/permissions/principal/types/permissions-principal.type';
import { getPermissionsPrincipalRoleIds } from 'src/engine/permissions/principal/utils/get-permissions-principal-role-ids.util';
import { buildRowLevelPermissionRecordFilter } from 'src/engine/permissions/rls/utils/build-row-level-permission-record-filter.util';

export const resolveRowLevelPermissionRecordFilter = ({
  principal,
  metadataMaps,
  flatObjectMetadata,
}: {
  principal: PermissionsPrincipal;
  metadataMaps: PermissionsMetadataMaps;
  flatObjectMetadata: FlatObjectMetadata;
}): RecordGqlOperationFilter | null => {
  const roleIds = getPermissionsPrincipalRoleIds(principal);

  if (roleIds.length === 0) {
    return null;
  }

  const recordFilter = buildRowLevelPermissionRecordFilter({
    flatRowLevelPermissionPredicateMaps:
      metadataMaps.flatRowLevelPermissionPredicateMaps,
    flatRowLevelPermissionPredicateGroupMaps:
      metadataMaps.flatRowLevelPermissionPredicateGroupMaps,
    flatFieldMetadataMaps: metadataMaps.flatFieldMetadataMaps,
    flatObjectMetadataMaps: metadataMaps.flatObjectMetadataMaps,
    objectMetadata: flatObjectMetadata,
    roleIds,
    workspaceMember: principal.workspaceMember,
  });

  return isDefined(recordFilter) && Object.keys(recordFilter).length > 0
    ? recordFilter
    : null;
};
