/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsMetadataMaps } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { getPermissionsPrincipalsRecordsPermissions } from 'src/engine/permissions/internal/role/utils/get-permissions-principals-records-permissions.util';
import { hasWorkspaceMemberBoundPredicates } from 'src/engine/permissions/internal/rls/utils/has-workspace-member-bound-predicates.util';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class PermissionsMetadataMapsService {
  private readonly metadataMapsByPrincipals = new WeakMap<
    PermissionsPrincipalsWithRolesContext,
    Promise<PermissionsMetadataMaps>
  >();

  private readonly recordsPermissionsByPrincipals = new WeakMap<
    PermissionsPrincipalsWithRolesContext,
    Promise<RoleRecordsPermissions>
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

  loadForPrincipals({
    principals,
  }: {
    principals: PermissionsPrincipalsWithRolesContext;
  }): Promise<PermissionsMetadataMaps> {
    const cachedMetadataMaps = this.metadataMapsByPrincipals.get(principals);

    if (isDefined(cachedMetadataMaps)) {
      return cachedMetadataMaps;
    }

    const metadataMaps = this.load({ workspaceId: principals.workspaceId });

    this.metadataMapsByPrincipals.set(principals, metadataMaps);

    return metadataMaps;
  }

  loadRecordsPermissionsForPrincipals({
    principals,
  }: {
    principals: PermissionsPrincipalsWithRolesContext;
  }): Promise<RoleRecordsPermissions> {
    const cachedRecordsPermissions =
      this.recordsPermissionsByPrincipals.get(principals);

    if (isDefined(cachedRecordsPermissions)) {
      return cachedRecordsPermissions;
    }

    const recordsPermissions = this.loadForPrincipals({ principals }).then(
      (metadataMaps) =>
        getPermissionsPrincipalsRecordsPermissions({
          principals,
          metadataMaps,
        }),
    );

    this.recordsPermissionsByPrincipals.set(principals, recordsPermissions);

    return recordsPermissions;
  }
}
