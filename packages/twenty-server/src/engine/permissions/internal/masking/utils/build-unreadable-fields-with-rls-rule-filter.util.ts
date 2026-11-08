import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type PermissionsMetadataMaps } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { type UnreadableFieldsWithRlsRuleFilter } from 'src/engine/permissions/internal/masking/types/unreadable-fields-with-rls-rule-filter.type';
import { getPermissionsPrincipalsRoleIds } from 'src/engine/permissions/internal/principal/utils/get-permissions-principals-role-ids.util';
import { buildRecordFilterForRole } from 'src/engine/permissions/internal/rls/utils/build-row-level-permission-record-filter.util';
import { resolveRowLevelPermissionWorkspaceMember } from 'src/engine/permissions/internal/rls/utils/resolve-row-level-permission-workspace-member.util';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';

export const buildUnreadableFieldsWithRlsRuleFilter = ({
  principals,
  metadataMaps,
  flatObjectMetadata,
}: {
  principals: PermissionsPrincipalsWithRolesContext;
  metadataMaps: PermissionsMetadataMaps;
  flatObjectMetadata: FlatObjectMetadata;
}): UnreadableFieldsWithRlsRuleFilter[] =>
  getPermissionsPrincipalsRoleIds(principals).flatMap((roleId) => {
    const fieldMetadataIds =
      metadataMaps.rolesPermissions[roleId]?.objects[flatObjectMetadata.id]
        ?.rowLevelRecordsPermissions?.unreadableFields;

    if (!isNonEmptyArray(fieldMetadataIds)) {
      return [];
    }

    const rlsRuleFilter = buildRecordFilterForRole({
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

    return isDefined(rlsRuleFilter)
      ? [{ rlsRuleFilter, fieldMetadataIds }]
      : [];
  });
