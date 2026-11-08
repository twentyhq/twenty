import { isDefined, isEmptyObject, isNonEmptyArray } from 'twenty-shared/utils';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type PermissionsMetadataMaps } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { type UnreadableFieldsWithRecordFilter } from 'src/engine/permissions/internal/masking/types/unreadable-fields-with-record-filter.type';
import { getPermissionsPrincipalsRoleIds } from 'src/engine/permissions/internal/principal/utils/get-permissions-principals-role-ids.util';
import { buildRecordFilterForRole } from 'src/engine/permissions/internal/rls/utils/build-row-level-permission-record-filter.util';
import { resolveRowLevelPermissionWorkspaceMember } from 'src/engine/permissions/internal/rls/utils/resolve-row-level-permission-workspace-member.util';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';

export const buildUnreadableFieldsWithRecordFilter = ({
  principals,
  metadataMaps,
  flatObjectMetadata,
}: {
  principals: PermissionsPrincipalsWithRolesContext;
  metadataMaps: PermissionsMetadataMaps;
  flatObjectMetadata: FlatObjectMetadata;
}): UnreadableFieldsWithRecordFilter[] =>
  getPermissionsPrincipalsRoleIds(principals).flatMap((roleId) => {
    const unreadableFieldMetadataIds =
      metadataMaps.rolesPermissions[roleId]?.objects[flatObjectMetadata.id]
        ?.rowLevelRecordsPermissions?.unreadableFields;

    if (!isNonEmptyArray(unreadableFieldMetadataIds)) {
      return [];
    }

    const recordFilter = buildRecordFilterForRole({
      flatRowLevelPermissionPredicateMaps:
        metadataMaps.flatRowLevelPermissionPredicateMaps,
      flatRowLevelPermissionPredicateGroupMaps:
        metadataMaps.flatRowLevelPermissionPredicateGroupMaps,
      flatFieldMetadataMaps: metadataMaps.flatFieldMetadataMaps,
      flatObjectMetadataMaps: metadataMaps.flatObjectMetadataMaps,
      objectMetadata: flatObjectMetadata,
      roleId,
      workspaceMember: resolveRowLevelPermissionWorkspaceMember({
        principals,
        metadataMaps,
      }),
    });

    return isDefined(recordFilter) && !isEmptyObject(recordFilter)
      ? [{ recordFilter, unreadableFieldMetadataIds }]
      : [];
  });
