/* @license Enterprise */

import { type RecordGqlOperationFilter } from 'twenty-shared/types';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type PermissionsMetadataMaps } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { buildRecordFilterForRole } from 'src/engine/permissions/internal/rls/utils/build-row-level-permission-record-filter.util';
import { resolveRowLevelPermissionWorkspaceMember } from 'src/engine/permissions/internal/rls/utils/resolve-row-level-permission-workspace-member.util';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';

export const resolveRowLevelPermissionRecordFilterForRole = ({
  principals,
  metadataMaps,
  flatObjectMetadata,
  roleId,
}: {
  principals: Pick<PermissionsPrincipalsWithRolesContext, 'mainPrincipal'>;
  metadataMaps: PermissionsMetadataMaps;
  flatObjectMetadata: FlatObjectMetadata;
  roleId: string;
}): RecordGqlOperationFilter | null =>
  buildRecordFilterForRole({
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
