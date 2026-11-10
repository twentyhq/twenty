/* @license Enterprise */

import { type RecordGqlOperationFilter } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type PermissionsMetadataMaps } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { buildMemberFieldValuesOrThrow } from 'src/engine/permissions/internal/rls/utils/build-member-field-values-or-throw.util';
import {
  buildRowLevelPermissionRecordFilter,
  type RowLevelPermissionRule,
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
  const rowLevelPermissionRules: RowLevelPermissionRule[] = [
    roleId ?? principals.mainPrincipal.roleId,
  ]
    .map(
      (principalRoleId) =>
        metadataMaps.rolesPermissions[principalRoleId]?.objects[
          flatObjectMetadata.id
        ]?.rowLevelRecordsPermissions,
    )
    .filter(isDefined);

  if (rowLevelPermissionRules.length === 0) {
    return null;
  }

  const workspaceMember = resolveRowLevelPermissionWorkspaceMember({
    principals,
    metadataMaps,
  });

  return buildRowLevelPermissionRecordFilter({
    rowLevelPermissionRules,
    memberFieldValues: buildMemberFieldValuesOrThrow({
      workspaceMember,
      predicates: rowLevelPermissionRules.flatMap(
        ({ predicates }) => predicates,
      ),
      flatFieldMetadataMaps: metadataMaps.flatFieldMetadataMaps,
    }),
    currentWorkspaceMemberId: workspaceMember?.id,
    flatFieldMetadataMaps: metadataMaps.flatFieldMetadataMaps,
    flatObjectMetadataMaps: metadataMaps.flatObjectMetadataMaps,
    isRelationHopEnabled: isRowLevelPermissionRelationHopEnabled(
      metadataMaps.featureFlagsMap,
    ),
  });
};
