/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { type PermissionsMetadataMaps } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { hasWorkspaceMemberBoundPredicates } from 'src/engine/permissions/rls/utils/has-workspace-member-bound-predicates.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class PermissionsMetadataMapsService {
  constructor(private readonly workspaceCacheService: WorkspaceCacheService) {}

  async load({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<PermissionsMetadataMaps> {
    const {
      flatObjectMetadataMaps,
      flatFieldMetadataMapsOrm,
      featureFlagsMap,
      rolesPermissions,
      flatApplicationMaps,
      flatRowLevelPermissionPredicateMaps,
      flatRowLevelPermissionPredicateGroupMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
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

    if (
      !hasWorkspaceMemberBoundPredicates(flatRowLevelPermissionPredicateMaps)
    ) {
      return metadataMaps;
    }

    const { flatWorkspaceMemberMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatWorkspaceMemberMaps',
      ]);

    return { ...metadataMaps, flatWorkspaceMemberMaps };
  }
}
