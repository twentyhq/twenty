/* @license Enterprise */

import { type PermissionsEnvironment } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

export const loadPermissionsEnvironment = async ({
  workspaceCacheService,
  workspaceId,
}: {
  workspaceCacheService: WorkspaceCacheService;
  workspaceId: string;
}): Promise<PermissionsEnvironment> => {
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

  return {
    flatObjectMetadataMaps,
    flatFieldMetadataMaps: flatFieldMetadataMapsOrm,
    featureFlagsMap,
    rolesPermissions,
    flatApplicationMaps,
    flatRowLevelPermissionPredicateMaps,
    flatRowLevelPermissionPredicateGroupMaps,
  };
};
