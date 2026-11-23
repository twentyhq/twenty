import { Injectable } from '@nestjs/common';

import { type FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { buildApiKeyExemptRolesPermissions } from 'src/engine/permissions/channel-visibility/utils/build-api-key-exempt-roles-permissions.util';
import { isApiKeyExemptFromChannelVisibility } from 'src/engine/permissions/channel-visibility/utils/is-api-key-exempt-from-channel-visibility.util';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type RolesPermissionsContext = {
  workspaceId: string;
  rolesPermissions: Record<string, RoleRecordsPermissions>;
  featureFlagsMap: Partial<Record<FeatureFlagKey, boolean>>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
};

@Injectable()
export class ApiKeyChannelVisibilityExemptionService {
  constructor(private readonly workspaceCacheService: WorkspaceCacheService) {}

  async findPrincipalsRolesPermissions({
    principals,
    ...context
  }: Omit<RolesPermissionsContext, 'workspaceId'> & {
    principals: Pick<
      PermissionsPrincipalsWithRolesContext,
      'workspaceId' | 'mainPrincipal'
    >;
  }): Promise<Record<string, RoleRecordsPermissions>> {
    if (principals.mainPrincipal.type !== 'apiKey') {
      return context.rolesPermissions;
    }

    return this.buildRolesPermissions({
      ...context,
      workspaceId: principals.workspaceId,
      roleIds: principals.mainPrincipal.roleIds,
    });
  }

  async findRolesPermissionsWithApiKeyEntries(
    context: RolesPermissionsContext,
  ): Promise<Record<string, RoleRecordsPermissions>> {
    if (!isApiKeyExemptFromChannelVisibility(context.featureFlagsMap)) {
      return context.rolesPermissions;
    }

    const { flatRoleMaps } = await this.workspaceCacheService.getOrRecompute(
      context.workspaceId,
      ['flatRoleMaps'],
    );
    const apiKeyRoleIds = Object.values(flatRoleMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter(({ canBeAssignedToApiKeys }) => canBeAssignedToApiKeys)
      .map(({ id }) => id);
    const apiKeyRolesPermissions = await this.buildRolesPermissions({
      ...context,
      roleIds: apiKeyRoleIds,
    });

    return {
      ...context.rolesPermissions,
      ...Object.fromEntries(
        apiKeyRoleIds
          .filter(
            (roleId) =>
              apiKeyRolesPermissions[roleId] !==
              context.rolesPermissions[roleId],
          )
          .map((roleId) => [
            `${roleId}:apiKey`,
            apiKeyRolesPermissions[roleId],
          ]),
      ),
    };
  }

  private async buildRolesPermissions({
    workspaceId,
    rolesPermissions,
    featureFlagsMap,
    flatObjectMetadataMaps,
    roleIds,
  }: RolesPermissionsContext & {
    roleIds: string[];
  }): Promise<Record<string, RoleRecordsPermissions>> {
    if (!isApiKeyExemptFromChannelVisibility(featureFlagsMap)) {
      return rolesPermissions;
    }

    const {
      flatRoleMaps,
      flatRowLevelPermissionRuleMaps,
      flatObjectPermissionMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatRoleMaps',
      'flatRowLevelPermissionRuleMaps',
      'flatObjectPermissionMaps',
    ]);

    return buildApiKeyExemptRolesPermissions({
      rolesPermissions,
      roleIds,
      flatRoleMaps,
      flatObjectMetadataMaps,
      flatRowLevelPermissionRuleMaps,
      flatObjectPermissionMaps,
    });
  }
}
