/* @license Enterprise */

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type AccessGroupWithoutCompactId } from 'src/engine/permissions/internal/access-group/types/access-group.type';
import { buildRoleAccessGroupsOrThrow } from 'src/engine/permissions/internal/access-group/utils/build-role-access-groups-or-throw.util';
import { type PermissionsObjectAccessRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { findRelatedRecordPathsGrantingOperation } from 'src/engine/permissions/internal/related-record-path/utils/find-related-record-paths-granting-operation.util';
import { canRelatedRecordPathsReachObject } from 'src/engine/permissions/internal/related-record-path/utils/can-related-record-paths-reach-object.util';
import { areRecordIdsReadableByPrincipals } from 'src/engine/permissions/internal/role/utils/are-record-ids-readable-by-principals.util';
import { isRowLevelPermissionRelationHopEnabled } from 'src/engine/permissions/internal/rls/utils/is-row-level-permission-relation-hop-enabled.util';
import { type RowLevelPermissionWorkspaceMember } from 'src/engine/permissions/internal/rls/types/row-level-permission-workspace-member.type';

export const buildCallerRelatedRecordPathAccessGroupsOrThrow = ({
  request,
  workspaceMembers,
  flatFieldMetadataMaps,
  visitedObjectMetadataIds = [],
}: {
  request: PermissionsObjectAccessRequest;
  workspaceMembers: RowLevelPermissionWorkspaceMember[];
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  visitedObjectMetadataIds?: string[];
}): AccessGroupWithoutCompactId[] => {
  const { principals, metadataMaps, flatObjectMetadata } = request;
  const { roleId } = principals.mainPrincipal;
  const nextVisitedObjectMetadataIds = [
    ...visitedObjectMetadataIds,
    flatObjectMetadata.id,
  ];

  return findRelatedRecordPathsGrantingOperation(request).flatMap(
    ({ isInherent, sourceFlatObjectMetadata }) => {
      const sourceRequest = {
        ...request,
        flatObjectMetadata: sourceFlatObjectMetadata,
      };

      if (!canRelatedRecordPathsReachObject(sourceRequest)) {
        return [];
      }

      return [
        ...(areRecordIdsReadableByPrincipals(sourceRequest)
          ? buildRoleAccessGroupsOrThrow({
              roleId,
              objectMetadataId: sourceFlatObjectMetadata.id,
              objectRecordsPermissions:
                metadataMaps.rolesPermissions[roleId]?.objects[
                  sourceFlatObjectMetadata.id
                ],
              operationTypes: [request.operationType],
              workspaceMembers,
              flatFieldMetadataMaps,
              isRelationHopEnabled: isRowLevelPermissionRelationHopEnabled(
                metadataMaps.featureFlagsMap,
              ),
            })
          : []),
        ...(isInherent &&
        !nextVisitedObjectMetadataIds.includes(sourceFlatObjectMetadata.id)
          ? buildCallerRelatedRecordPathAccessGroupsOrThrow({
              request: sourceRequest,
              workspaceMembers,
              flatFieldMetadataMaps,
              visitedObjectMetadataIds: nextVisitedObjectMetadataIds,
            })
          : []),
      ];
    },
  );
};
