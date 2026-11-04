/* @license Enterprise */

import { type PermissionsMetadataMaps } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { hasWorkspaceMemberBoundPredicates } from 'src/engine/permissions/rls/utils/has-workspace-member-bound-predicates.util';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

export const loadPermissionsMetadataMaps = async ({
  workspaceCacheService,
  workspaceId,
}: {
  workspaceCacheService: WorkspaceCacheService;
  workspaceId: string;
}): Promise<PermissionsMetadataMaps> => {
  const {
    flatObjectMetadataMaps,
    flatFieldMetadataMapsOrm,
    featureFlagsMap,
    rolesPermissions,
    flatApplicationMaps,
    flatRowLevelPermissionPredicateMaps,
    flatRowLevelPermissionPredicateGroupMaps,
  } = await workspaceCacheService.getOrRecompute(workspaceId, [
    'flatObjectMetadataMaps',
    'flatFieldMetadataMapsOrm',
    'featureFlagsMap',
    'rolesPermissions',
    'flatApplicationMaps',
    'flatRowLevelPermissionPredicateMaps',
    'flatRowLevelPermissionPredicateGroupMaps',
  ]);

  const metadataMaps: PermissionsMetadataMaps = {
    flatObjectMetadataMaps,
    flatFieldMetadataMaps: flatFieldMetadataMapsOrm,
    featureFlagsMap,
    rolesPermissions,
    flatApplicationMaps,
    flatRowLevelPermissionPredicateMaps,
    flatRowLevelPermissionPredicateGroupMaps,
  };

  if (!hasWorkspaceMemberBoundPredicates(flatRowLevelPermissionPredicateMaps)) {
    return metadataMaps;
  }

  const { flatWorkspaceMemberMaps } =
    await workspaceCacheService.getOrRecompute(workspaceId, [
      'flatWorkspaceMemberMaps',
    ]);

  return { ...metadataMaps, flatWorkspaceMemberMaps };
};
