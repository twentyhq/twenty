/* @license Enterprise */

import { type RecordGqlOperationFilter } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type PermissionsMetadataMaps } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { getPermissionsPrincipalsRoleIds } from 'src/engine/permissions/internal/principal/utils/get-permissions-principals-role-ids.util';
import {
  buildRecordFilterForRole,
  buildRowLevelPermissionRecordFilter,
} from 'src/engine/permissions/internal/rls/utils/build-row-level-permission-record-filter.util';
import { isRowLevelPermissionRelationHopEnabled } from 'src/engine/permissions/internal/rls/utils/is-row-level-permission-relation-hop-enabled.util';
import { resolveRowLevelPermissionWorkspaceMember } from 'src/engine/permissions/internal/rls/utils/resolve-row-level-permission-workspace-member.util';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';

export const resolveRlsRuleRecordFilter = ({
  principals,
  metadataMaps,
  flatObjectMetadata,
  roleId,
}: {
  principals: PermissionsPrincipalsWithRolesContext;
  metadataMaps: PermissionsMetadataMaps;
  flatObjectMetadata: FlatObjectMetadata;
  roleId?: string;
}): RecordGqlOperationFilter | null => {
  const buildArgs = {
    flatRowLevelPermissionPredicateMaps:
      metadataMaps.flatRowLevelPermissionPredicateMaps,
    flatRowLevelPermissionPredicateGroupMaps:
      metadataMaps.flatRowLevelPermissionPredicateGroupMaps,
    flatFieldMetadataMaps: metadataMaps.flatFieldMetadataMaps,
    flatObjectMetadataMaps: metadataMaps.flatObjectMetadataMaps,
    objectMetadata: flatObjectMetadata,
    isRelationHopEnabled: isRowLevelPermissionRelationHopEnabled(
      metadataMaps.featureFlagsMap,
    ),
    workspaceMember: resolveRowLevelPermissionWorkspaceMember({
      principals,
      metadataMaps,
    }),
  };

  return isDefined(roleId)
    ? buildRecordFilterForRole({ ...buildArgs, roleId })
    : buildRowLevelPermissionRecordFilter({
        ...buildArgs,
        roleIds: getPermissionsPrincipalsRoleIds(principals),
      });
};
