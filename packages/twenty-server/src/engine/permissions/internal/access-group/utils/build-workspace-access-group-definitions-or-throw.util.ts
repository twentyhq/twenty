/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type FlatWorkspaceMemberMaps } from 'src/engine/core-modules/user/types/flat-workspace-member-maps.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type AccessGroupDefinition } from 'src/engine/permissions/internal/access-group/types/access-group-definition.type';
import { buildRoleAccessGroupDefinitionsOrThrow } from 'src/engine/permissions/internal/access-group/utils/build-role-access-group-definitions-or-throw.util';
import { type RowLevelPermissionWorkspaceMember } from 'src/engine/permissions/internal/rls/types/row-level-permission-workspace-member.type';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';
import { isPermissionStorageObject } from 'src/engine/permissions/utils/is-permission-storage-object.util';

const groupWorkspaceMembersByRoleId = ({
  userWorkspaceRoleMap,
  flatWorkspaceMemberMaps,
}: {
  userWorkspaceRoleMap: Record<string, string>;
  flatWorkspaceMemberMaps: Pick<
    FlatWorkspaceMemberMaps,
    'idByUserWorkspaceId' | 'byId'
  >;
}): Map<string, RowLevelPermissionWorkspaceMember[]> => {
  const workspaceMembersByRoleId = new Map<
    string,
    RowLevelPermissionWorkspaceMember[]
  >();

  for (const [userWorkspaceId, roleId] of Object.entries(
    userWorkspaceRoleMap,
  )) {
    const workspaceMemberId =
      flatWorkspaceMemberMaps.idByUserWorkspaceId[userWorkspaceId];
    const workspaceMember = isDefined(workspaceMemberId)
      ? flatWorkspaceMemberMaps.byId[workspaceMemberId]
      : undefined;

    if (isDefined(workspaceMember)) {
      workspaceMembersByRoleId.set(roleId, [
        ...(workspaceMembersByRoleId.get(roleId) ?? []),
        workspaceMember,
      ]);
    }
  }

  return workspaceMembersByRoleId;
};

export const buildWorkspaceAccessGroupDefinitionsOrThrow = ({
  rolesPermissions,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  userWorkspaceRoleMap,
  flatWorkspaceMemberMaps,
}: {
  rolesPermissions: Record<string, RoleRecordsPermissions>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  userWorkspaceRoleMap: Record<string, string>;
  flatWorkspaceMemberMaps: FlatWorkspaceMemberMaps;
}): AccessGroupDefinition[] => {
  const workspaceMembersByRoleId = groupWorkspaceMembersByRoleId({
    userWorkspaceRoleMap,
    flatWorkspaceMemberMaps,
  });
  const definitionByGroupHash = new Map<string, AccessGroupDefinition>();

  for (const [roleId, { objects }] of Object.entries(rolesPermissions)) {
    for (const [objectMetadataId, objectRecordsPermissions] of Object.entries(
      objects,
    )) {
      const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: objectMetadataId,
        flatEntityMaps: flatObjectMetadataMaps,
      });

      if (
        !isDefined(flatObjectMetadata) ||
        isPermissionStorageObject(flatObjectMetadata)
      ) {
        continue;
      }

      for (const definition of buildRoleAccessGroupDefinitionsOrThrow({
        roleId,
        objectMetadataId,
        objectRecordsPermissions,
        workspaceMembers: workspaceMembersByRoleId.get(roleId) ?? [],
        flatFieldMetadataMaps,
      })) {
        definitionByGroupHash.set(definition.groupHash, definition);
      }
    }
  }

  return [...definitionByGroupHash.values()];
};
