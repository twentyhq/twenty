/* @license Enterprise */

import { type FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatWorkspaceMemberMaps } from 'src/engine/core-modules/user/types/flat-workspace-member-maps.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type AccessGroupWithoutCompactId } from 'src/engine/permissions/internal/access-group/types/access-group.type';
import { isRlsRelationHopEnabled } from 'src/engine/permissions/internal/rls/utils/is-rls-relation-hop-enabled.util';
import { buildRoleAccessGroupsOrThrow } from 'src/engine/permissions/internal/access-group/utils/build-role-access-groups-or-throw.util';
import { PermissionsException } from 'src/engine/permissions/permissions.exception';
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
}: {
  userWorkspaceRoleMap: Record<string, string>;
  flatWorkspaceMemberMaps: AccessGroupWorkspaceMemberMaps;
}): Map<string, RlsWorkspaceMember[]> => {
  const workspaceMembersByRoleId = new Map<string, RlsWorkspaceMember[]>();

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

export const buildWorkspaceAccessGroups = ({
  featureFlagsMap,
  rolesPermissions,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  userWorkspaceRoleMap,
  flatWorkspaceMemberMaps,
}: {
  featureFlagsMap: Partial<Record<FeatureFlagKey, boolean>>;
  rolesPermissions: Record<string, RoleRecordsPermissions>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  userWorkspaceRoleMap: Record<string, string>;
  flatWorkspaceMemberMaps: AccessGroupWorkspaceMemberMaps;
}): {
  accessGroups: AccessGroupWithoutCompactId[];
  hasFailures: boolean;
} => {
  const workspaceMembersByRoleId = groupWorkspaceMembersByRoleId({
    userWorkspaceRoleMap,
    flatWorkspaceMemberMaps,
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
          roleId,
          objectMetadataId,
          objectRecordsPermissions,
          workspaceMembers: workspaceMembersByRoleId.get(roleId) ?? [],
          flatFieldMetadataMaps,
          isRelationHopEnabled: isRlsRelationHopEnabled(featureFlagsMap),
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
