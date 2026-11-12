/* @license Enterprise */

import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsMetadataMaps } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { RelatedRecordPathReadService } from 'src/engine/permissions/internal/related-record-path/services/related-record-path-read.service';
import { getPermissionsPrincipalsRecordsPermissions } from 'src/engine/permissions/internal/role/utils/get-permissions-principals-records-permissions.util';
import { findWorkspaceMemberBoundPredicates } from 'src/engine/permissions/internal/rls/utils/find-workspace-member-bound-predicates.util';
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

  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly relatedRecordPathReadService: RelatedRecordPathReadService,
  ) {}

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
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMapsOrm',
      'featureFlagsMap',
      'rolesPermissions',
    ]);

    const metadataMaps: PermissionsMetadataMaps = {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps: flatFieldMetadataMapsOrm,
      featureFlagsMap,
      rolesPermissions,
    };

    const [flatWorkspaceMemberMaps, flatRelatedRecordPathMaps] =
      await Promise.all([
        findWorkspaceMemberBoundPredicates(rolesPermissions).length > 0
          ? this.workspaceCacheService
              .getOrRecompute(workspaceId, ['flatWorkspaceMemberMaps'])
              .then((cache) => cache.flatWorkspaceMemberMaps)
          : undefined,
        this.relatedRecordPathReadService.findEnabledFlatRelatedRecordPathMaps({
          workspaceId,
          featureFlagsMap,
        }),
      ]);

    return {
      ...metadataMaps,
      ...(isDefined(flatWorkspaceMemberMaps) && { flatWorkspaceMemberMaps }),
      ...(isDefined(flatRelatedRecordPathMaps) && {
        flatRelatedRecordPathMaps,
      }),
    };
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
