/* @license Enterprise */

import { type RecordGqlOperationFilter } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type PermissionsMetadataMaps } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { getPermissionsPrincipalsRoleIds } from 'src/engine/permissions/internal/principal/utils/get-permissions-principals-role-ids.util';
import { buildRowLevelPermissionRecordFilter } from 'src/engine/permissions/internal/rls/utils/build-row-level-permission-record-filter.util';
import { isPermissionMainPrincipalWorkspaceMember } from 'src/engine/permissions/internal/principal/utils/is-permission-main-principal-workspace-member.util';

export const resolveRowLevelPermissionRecordFilter = ({
  principals,
  metadataMaps,
  flatObjectMetadata,
}: {
  principals: PermissionsPrincipalsWithRolesContext;
  metadataMaps: PermissionsMetadataMaps;
  flatObjectMetadata: FlatObjectMetadata;
}): RecordGqlOperationFilter | null => {
  const roleIds = getPermissionsPrincipalsRoleIds(principals);
  const workspaceMemberId = isPermissionMainPrincipalWorkspaceMember(
    principals.mainPrincipal,
  )
    ? principals.mainPrincipal.workspaceMemberId
    : undefined;

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
    workspaceMember: isDefined(workspaceMemberId)
      ? (metadataMaps.flatWorkspaceMemberMaps?.byId[workspaceMemberId] ?? {
          id: workspaceMemberId,
        })
      : undefined,
  });

  return isDefined(recordFilter) && Object.keys(recordFilter).length > 0
    ? recordFilter
    : null;
};
