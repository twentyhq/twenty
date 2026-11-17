/* @license Enterprise */

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type AccessGroupWithoutCompactId } from 'src/engine/permissions/internal/access-group/types/access-group.type';
import { buildRoleAccessGroupsOrThrow } from 'src/engine/permissions/internal/access-group/utils/build-role-access-groups-or-throw.util';
import { type PermissionsObjectAccessRequest } from 'src/engine/permissions/internal/combine/types/permissions-access-request.type';
import { findRelatedRecordPathsExtendingAccess } from 'src/engine/permissions/internal/related-record-path/utils/find-related-record-paths-extending-access.util';
import { canRelatedRecordPathExtendAccessToObject } from 'src/engine/permissions/internal/related-record-path/utils/can-related-record-path-extend-access-to-object.util';
import { findFieldMetadataIdsUnreadableByPrincipals } from 'src/engine/permissions/internal/related-record-path/utils/find-field-metadata-ids-unreadable-by-principals.util';
import { findSourceObjectMetadataIdsWithHiddenPath } from 'src/engine/permissions/internal/related-record-path/utils/find-source-object-metadata-ids-with-hidden-path.util';
import { areRecordIdsReadableByPrincipals } from 'src/engine/permissions/internal/role/utils/are-record-ids-readable-by-principals.util';
import { isRlsRelationHopEnabled } from 'src/engine/permissions/internal/rls/utils/is-rls-relation-hop-enabled.util';
import { type RlsWorkspaceMember } from 'src/engine/permissions/internal/rls/types/rls-workspace-member.type';

export const buildPrincipalsRelatedRecordPathAccessGroupsOrThrow = ({
  request,
  workspaceMembers,
  flatFieldMetadataMaps,
  visitedObjectMetadataIds = [],
  unreadableFieldMetadataIds = findFieldMetadataIdsUnreadableByPrincipals(
    request,
  ),
}: {
  request: PermissionsObjectAccessRequest;
  workspaceMembers: RlsWorkspaceMember[];
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  visitedObjectMetadataIds?: string[];
  unreadableFieldMetadataIds?: Set<string>;
}): AccessGroupWithoutCompactId[] => {
  const { principals, metadataMaps, flatObjectMetadata } = request;
  const mainRoleIds = principals.mainPrincipal.roleIds;
  const nextVisitedObjectMetadataIds = [
    ...visitedObjectMetadataIds,
    flatObjectMetadata.id,
  ];

  const sourceObjectMetadataIdsWithHiddenPath =
    findSourceObjectMetadataIdsWithHiddenPath({
      request,
      unreadableFieldMetadataIds,
    });

  return findRelatedRecordPathsExtendingAccess(request).flatMap(
    ({ isInherent, sourceFlatObjectMetadata }) => {
      const sourceRequest = {
        ...request,
        flatObjectMetadata: sourceFlatObjectMetadata,
      };

      if (
        sourceObjectMetadataIdsWithHiddenPath.has(
          sourceFlatObjectMetadata.id,
        ) ||
        !canRelatedRecordPathExtendAccessToObject(sourceRequest)
      ) {
        return [];
      }

      return [
        ...(areRecordIdsReadableByPrincipals(sourceRequest)
          ? mainRoleIds.flatMap((roleId) =>
              buildRoleAccessGroupsOrThrow({
                roleId,
                objectMetadataId: sourceFlatObjectMetadata.id,
                objectRecordsPermissions:
                  metadataMaps.rolesPermissions[roleId]?.objects[
                    sourceFlatObjectMetadata.id
                  ],
                operationTypes: [request.operationType],
                workspaceMembers,
                flatFieldMetadataMaps,
                isRelationHopEnabled: isRlsRelationHopEnabled(
                  metadataMaps.featureFlagsMap,
                ),
              }),
            )
          : []),
        ...(isInherent &&
        !nextVisitedObjectMetadataIds.includes(sourceFlatObjectMetadata.id)
          ? buildPrincipalsRelatedRecordPathAccessGroupsOrThrow({
              request: sourceRequest,
              workspaceMembers,
              flatFieldMetadataMaps,
              visitedObjectMetadataIds: nextVisitedObjectMetadataIds,
              unreadableFieldMetadataIds,
            })
          : []),
      ];
    },
  );
};
