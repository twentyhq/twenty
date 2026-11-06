/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsMetadataMaps } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { getPermissionsPrincipalsRecordsPermissions } from 'src/engine/permissions/internal/role/utils/get-permissions-principals-records-permissions.util';
import { hasWorkspaceMemberBoundPredicates } from 'src/engine/permissions/internal/rls/utils/has-workspace-member-bound-predicates.util';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type LoadedPrincipalsPermissions = {
  metadataMaps: PermissionsMetadataMaps;
  recordsPermissions: RoleRecordsPermissions;
};

@Injectable()
export class PermissionsMetadataMapsService {
  private readonly loadedPermissionsByPrincipals = new WeakMap<
    PermissionsPrincipalsWithRolesContext,
    Promise<LoadedPrincipalsPermissions>
  >();

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

  async loadForPrincipals({
    principals,
  }: {
    principals: PermissionsPrincipalsWithRolesContext;
  }): Promise<PermissionsMetadataMaps> {
    const { metadataMaps } = await this.loadPermissionsForPrincipals({
      principals,
    });

    return metadataMaps;
  }

  async loadRecordsPermissionsForPrincipals({
    principals,
  }: {
    principals: PermissionsPrincipalsWithRolesContext;
  }): Promise<RoleRecordsPermissions> {
    const { recordsPermissions } = await this.loadPermissionsForPrincipals({
      principals,
    });

    return recordsPermissions;
  }

  private loadPermissionsForPrincipals({
    principals,
  }: {
    principals: PermissionsPrincipalsWithRolesContext;
  }): Promise<LoadedPrincipalsPermissions> {
    const cachedPermissions =
      this.loadedPermissionsByPrincipals.get(principals);

    if (isDefined(cachedPermissions)) {
      return cachedPermissions;
    }

    const loadedPermissions = this.load({
      workspaceId: principals.workspaceId,
    }).then((metadataMaps) => ({
      metadataMaps,
      recordsPermissions: getPermissionsPrincipalsRecordsPermissions({
        principals,
        metadataMaps,
      }),
    }));

    this.loadedPermissionsByPrincipals.set(principals, loadedPermissions);

    // A failed load must not fail every later question on these principals
    loadedPermissions.catch(() => {
      this.loadedPermissionsByPrincipals.delete(principals);
    });

    return loadedPermissions;
  }
}
