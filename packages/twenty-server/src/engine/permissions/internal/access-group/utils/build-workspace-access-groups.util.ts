/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type FlatWorkspaceMemberMaps } from 'src/engine/core-modules/user/types/flat-workspace-member-maps.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type UserWorkspaceRoleMap } from 'src/engine/metadata-modules/role-target/types/user-workspace-role-map.type';
import { type AccessGroupWithoutCompactId } from 'src/engine/permissions/internal/access-group/types/access-group-without-compact-id.type';
import { buildRoleAccessGroupsOrThrow } from 'src/engine/permissions/internal/access-group/utils/build-role-access-groups-or-throw.util';
import { PermissionsException } from 'src/engine/permissions/permissions.exception';
import { type RlsWorkspaceMemberRelationValueMaps } from 'src/engine/permissions/internal/rls/types/rls-workspace-member-relation-value-maps.type';
import { attachRlsRelationValues } from 'src/engine/permissions/internal/rls/utils/attach-rls-relation-values.util';
import { type RlsWorkspaceMember } from 'src/engine/permissions/internal/rls/types/rls-workspace-member.type';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';
import { temporaryExcludePermissionStorageObject } from 'src/engine/permissions/utils/temporary-exclude-permission-storage-object.util';

type AccessGroupWorkspaceMemberMaps = Pick<
  FlatWorkspaceMemberMaps,
  'idByUserWorkspaceId' | 'byId'
>;

const groupWorkspaceMembersByRoleId = ({
  userWorkspaceRoleMap,
  flatWorkspaceMemberMaps,
  rlsWorkspaceMemberRelationValueMaps,
}: {
  userWorkspaceRoleMap: UserWorkspaceRoleMap;
  flatWorkspaceMemberMaps: AccessGroupWorkspaceMemberMaps;
  rlsWorkspaceMemberRelationValueMaps?: RlsWorkspaceMemberRelationValueMaps;
}): Map<string, RlsWorkspaceMember[]> => {
  const workspaceMembersByRoleId = new Map<string, RlsWorkspaceMember[]>();
  const userWorkspaceRoleIds = Object.entries(userWorkspaceRoleMap).flatMap(
    ([userWorkspaceId, roleIds]) =>
      roleIds.map((roleId): [string, string] => [userWorkspaceId, roleId]),
  );

  for (const [userWorkspaceId, roleId] of userWorkspaceRoleIds) {
    const workspaceMemberId =
      flatWorkspaceMemberMaps.idByUserWorkspaceId[userWorkspaceId];
    const workspaceMember = isDefined(workspaceMemberId)
      ? flatWorkspaceMemberMaps.byId[workspaceMemberId]
      : undefined;

    if (isDefined(workspaceMember)) {
      workspaceMembersByRoleId.set(roleId, [
        ...(workspaceMembersByRoleId.get(roleId) ?? []),
        attachRlsRelationValues({
          workspaceMember,
          rlsWorkspaceMemberRelationValueMaps,
        }),
      ]);
    }
  }

  return workspaceMembersByRoleId;
};

export const buildWorkspaceAccessGroups = ({
  rolesPermissions,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  userWorkspaceRoleMap,
  flatWorkspaceMemberMaps,
  rlsWorkspaceMemberRelationValueMaps,
}: {
  rolesPermissions: Record<string, RoleRecordsPermissions>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  userWorkspaceRoleMap: UserWorkspaceRoleMap;
  flatWorkspaceMemberMaps: AccessGroupWorkspaceMemberMaps;
  rlsWorkspaceMemberRelationValueMaps?: RlsWorkspaceMemberRelationValueMaps;
}): {
  accessGroups: AccessGroupWithoutCompactId[];
  hasFailures: boolean;
} => {
  const workspaceMembersByRoleId = groupWorkspaceMembersByRoleId({
    userWorkspaceRoleMap,
    flatWorkspaceMemberMaps,
    rlsWorkspaceMemberRelationValueMaps,
  });
  const accessGroupByGroupHash = new Map<string, AccessGroupWithoutCompactId>();
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
        temporaryExcludePermissionStorageObject(flatObjectMetadata)
      ) {
        continue;
      }

      try {
        for (const accessGroup of buildRoleAccessGroupsOrThrow({
          objectMetadataId,
          objectRecordsPermissions,
          workspaceMembers: workspaceMembersByRoleId.get(roleId) ?? [],
          flatFieldMetadataMaps,
        })) {
          accessGroupByGroupHash.set(accessGroup.groupHash, accessGroup);
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
    accessGroups: [...accessGroupByGroupHash.values()],
    hasFailures,
  };
};
