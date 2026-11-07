/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type FlatWorkspaceMemberMaps } from 'src/engine/core-modules/user/types/flat-workspace-member-maps.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type NewAccessGroup } from 'src/engine/permissions/internal/access-group/types/new-access-group.type';
import { buildNewRoleAccessGroupsOrThrow } from 'src/engine/permissions/internal/access-group/utils/build-new-role-access-groups-or-throw.util';
import { PermissionsException } from 'src/engine/permissions/permissions.exception';
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

export const buildNewWorkspaceAccessGroups = ({
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
  flatWorkspaceMemberMaps: Pick<
    FlatWorkspaceMemberMaps,
    'idByUserWorkspaceId' | 'byId'
  >;
}): {
  newAccessGroups: NewAccessGroup[];
  hasFailures: boolean;
} => {
  const workspaceMembersByRoleId = groupWorkspaceMembersByRoleId({
    userWorkspaceRoleMap,
    flatWorkspaceMemberMaps,
  });
  const newAccessGroupByGroupHash = new Map<string, NewAccessGroup>();
  let hasFailures = false;

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

      try {
        for (const newAccessGroup of buildNewRoleAccessGroupsOrThrow({
          roleId,
          objectMetadataId,
          objectRecordsPermissions,
          workspaceMembers: workspaceMembersByRoleId.get(roleId) ?? [],
          flatFieldMetadataMaps,
        })) {
          newAccessGroupByGroupHash.set(
            newAccessGroup.groupHash,
            newAccessGroup,
          );
        }
      } catch (error) {
        if (!(error instanceof PermissionsException)) {
          throw error;
        }

        hasFailures = true;
      }
    }
  }

  return {
    newAccessGroups: [...newAccessGroupByGroupHash.values()],
    hasFailures,
  };
};
